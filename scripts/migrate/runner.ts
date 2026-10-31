/**
 * The migration runner behind `pnpm migrate`.
 * Versioned files in `migrations/` run once per database, in order,
 * each in its own transaction, and are checksummed so a shipped file
 * can't be edited. Every-deploy steps run after them on each run,
 * together in one transaction with the revision they record. Each
 * transaction's lock waits are bounded, and it's retried whole when
 * one runs out, so a live query is never the deadlock victim.
 * All of it happens under one advisory lock, so two builds starting
 * together never apply the same file twice.
 */
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** The slice of the driver's `Client` the runner uses. */
export type MigrationClient = {
  query: (
    text: string,
    values?: unknown[]
  ) => Promise<{ rows: Record<string, unknown>[] }>
}

export type Migration = {
  id: string
  checksum: string
  isTransactional: boolean
  up: (client: MigrationClient) => Promise<void>
}

export type EveryDeployStep = {
  name: string
  /** A banner to print to the build log once committed, if any. */
  run: (client: MigrationClient) => Promise<string | void>
}

export const NOT_CONNECTED_MESSAGE =
  "Database not connected: add Neon from your project's Storage tab, then redeploy"

// Arbitrary, but must never change: it's what concurrent builds wait on
const MIGRATION_LOCK_ID = 727_150_001

/**
 * How long a statement in one of the runner's transactions (each
 * transactional migration, and the every-deploy steps) waits on a
 * table lock before the whole transaction is rolled back and
 * retried. Under Postgres's 1s deadlock_timeout, so in a lock-order
 * cycle with a live query the runner always gives way first, before
 * the deadlock detector could abort that query (and before a long
 * queue builds up behind a waiting lock request). Even a no-op
 * `CREATE INDEX IF NOT EXISTS` takes its table's SHARE lock.
 */
const LOCK_TIMEOUT = '200ms'
const LOCK_RETRY_ATTEMPTS = 10
const LOCK_RETRY_DELAY_MS = 250
// lock_not_available (lock_timeout), deadlock_detected
const LOCK_CONFLICT_CODES = new Set(['55P03', '40P01'])

const NO_TRANSACTION_MARKER = '-- migrate:no-transaction'
// What may continue an unquoted identifier, per Postgres's lexer: $
// included (`idx$foo$` is one name), and any non-ASCII character
const IDENTIFIER_CHAR_PATTERN = /[\w$\u0080-\uffff]/
// $$ or $tag$, where a tag can't start with a digit (that's $1)
const DOLLAR_QUOTE_PATTERN =
  /^\$(?:[A-Za-z_\u0080-\uffff][\w\u0080-\uffff]*)?\$/
const BARE_HOSTNAME_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const MIGRATION_FILE_PATTERN = /^(\d{4})_[a-z0-9_]+\.(sql|ts)$/

type Env = Record<string, string | undefined>

export type RunDecision =
  | { isRun: true; url: string; isPreview: boolean }
  | { isRun: false; isError: boolean; message: string }

/**
 * Neon's pooled host is the direct host plus `-pooler`. Lowercased:
 * URL keeps a postgres:// host's case, but DNS ignores it.
 */
export function directHost(host: string): string {
  return host.toLowerCase().replace(/-pooler(?=\.)/, '')
}

function hostOf(url: string): string | undefined {
  try {
    return directHost(new URL(url).hostname)
  } catch {
    return undefined
  }
}

/** `host:port/database`, with Postgres's defaults filled in. */
function databaseOf(url: string): string | undefined {
  try {
    const parsed = new URL(url)
    const database =
      decodeURIComponent(parsed.pathname.slice(1)) ||
      decodeURIComponent(parsed.username)
    return `${directHost(parsed.hostname)}:${parsed.port || '5432'}/${database}`
  } catch {
    return undefined
  }
}

/** Decides whether this build migrates, and against which URL. */
export function decideRun(env: Env): RunDecision {
  const pooledOrDirect = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL
  if (!pooledOrDirect) {
    return {
      isRun: false,
      isError: true,
      message: NOT_CONNECTED_MESSAGE
    }
  }

  // Both are set together on Vercel; a local .env can drift apart
  if (env.DATABASE_URL_UNPOOLED && env.DATABASE_URL) {
    // An endpoint can hold several databases, so host alone isn't enough
    const unpooled = databaseOf(env.DATABASE_URL_UNPOOLED)
    const pooled = databaseOf(env.DATABASE_URL)
    if (unpooled && pooled && unpooled !== pooled) {
      return {
        isRun: false,
        isError: true,
        message: `DATABASE_URL_UNPOOLED (${unpooled}) and DATABASE_URL (${pooled}) point at different databases: fix or remove DATABASE_URL_UNPOOLED`
      }
    }
  }

  // Advisory locks need a session, which Neon's pooler doesn't keep
  const parsed = new URL(pooledOrDirect)
  parsed.hostname = directHost(parsed.hostname)
  const url = parsed.toString()

  const isPreview = env.VERCEL_ENV === 'preview'
  if (!isPreview) return { isRun: true, url, isPreview }

  const rawProductionHost = env.PRODUCTION_DATABASE_HOST?.trim()
  // A full URL would never equal a host, silently disabling the guard
  if (
    env.MIGRATE_PREVIEWS === '1' &&
    rawProductionHost &&
    !BARE_HOSTNAME_PATTERN.test(rawProductionHost)
  ) {
    return {
      isRun: false,
      isError: true,
      message:
        'PRODUCTION_DATABASE_HOST must be a bare hostname (e.g. ep-name-123.us-east-1.aws.neon.tech), not a URL or connection string'
    }
  }
  const productionHost = rawProductionHost
    ? directHost(rawProductionHost)
    : undefined
  if (env.MIGRATE_PREVIEWS !== '1' || !productionHost) {
    return {
      isRun: false,
      isError: false,
      message:
        'Skipping migrations on preview (set MIGRATE_PREVIEWS=1 and PRODUCTION_DATABASE_HOST to migrate preview branches)'
    }
  }
  if (hostOf(url) === productionHost) {
    return {
      isRun: false,
      isError: false,
      message:
        'Skipping migrations on preview: its database host is the production host'
    }
  }
  return { isRun: true, url, isPreview }
}

/** sha256 of a file, ignoring line-ending differences between OSes. */
export function checksumOf(contents: string): string {
  return createHash('sha256')
    .update(contents.replace(/\r\n/g, '\n'))
    .digest('hex')
}

/** Index just past the `*\/` closing the (nestable) comment at `i`. */
function blockCommentEnd(sql: string, i: number): number {
  let depth = 0
  while (i < sql.length) {
    if (sql[i] === '/' && sql[i + 1] === '*') {
      depth++
      i += 2
    } else if (sql[i] === '*' && sql[i + 1] === '/') {
      depth--
      i += 2
      if (!depth) return i
    } else {
      i++
    }
  }
  return sql.length
}

/** Index just past the quote closing the string opened at `i`. */
function quotedEnd(
  sql: string,
  i: number,
  isEscape: boolean
): number {
  const quote = sql[i]
  let j = i + 1
  while (j < sql.length) {
    if (isEscape && sql[j] === '\\') {
      j += 2
    } else if (sql[j] === quote) {
      // a doubled quote is an escaped one
      if (sql[j + 1] !== quote) return j + 1
      j += 2
    } else {
      j++
    }
  }
  return sql.length
}

/**
 * Splits SQL on top-level semicolons, skipping those inside quotes,
 * E'' escape strings, dollar-quoted bodies and (nested) comments.
 * Comment-only chunks are dropped.
 */
export function splitStatements(sql: string): string[] {
  const statements: string[] = []
  let start = 0
  let hasCode = false
  let i = 0

  while (i < sql.length) {
    const char = sql[i]
    const next = sql[i + 1]
    if (char === '-' && next === '-') {
      const end = sql.indexOf('\n', i)
      i = end === -1 ? sql.length : end + 1
    } else if (char === '/' && next === '*') {
      i = blockCommentEnd(sql, i)
    } else if (char === "'" || char === '"') {
      // E'…' (not the end of an identifier like `name'`) allows \'
      const isEscape =
        char === "'" &&
        /[eE]/.test(sql[i - 1] ?? '') &&
        !IDENTIFIER_CHAR_PATTERN.test(sql[i - 2] ?? '')
      i = quotedEnd(sql, i, isEscape)
      hasCode = true
    } else if (char === '$') {
      // a $ continuing an identifier never opens a dollar quote
      const tag = IDENTIFIER_CHAR_PATTERN.test(sql[i - 1] ?? '')
        ? undefined
        : DOLLAR_QUOTE_PATTERN.exec(sql.slice(i))?.[0]
      if (tag) {
        const end = sql.indexOf(tag, i + tag.length)
        i = end === -1 ? sql.length : end + tag.length
      } else {
        i++
      }
      hasCode = true
    } else if (char === ';') {
      if (hasCode) statements.push(sql.slice(start, i).trim())
      start = ++i
      hasCode = false
    } else {
      if (!/\s/.test(char ?? '')) hasCode = true
      i++
    }
  }
  if (hasCode) statements.push(sql.slice(start).trim())
  return statements
}

/** Reads `dir` into ordered migrations; a missing dir means none. */
export async function loadMigrations(
  dir: string
): Promise<Migration[]> {
  let names: string[]
  try {
    names = await readdir(dir)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }

  const files = names.filter((name) => !name.startsWith('.')).sort()
  const seenNumbers = new Map<string, string>()
  const migrations: Migration[] = []

  for (const name of files) {
    const match = MIGRATION_FILE_PATTERN.exec(name)
    if (!match) {
      throw new Error(
        `Unexpected file in migrations/: ${name} (expected NNNN_short_name.sql or .ts)`
      )
    }
    const [, number, ext] = match as unknown as [
      string,
      string,
      'sql' | 'ts'
    ]
    const clash = seenNumbers.get(number)
    if (clash) {
      throw new Error(
        `Two migrations share number ${number}: ${clash} and ${name}`
      )
    }
    seenNumbers.set(number, name)

    const path = join(dir, name)
    const contents = await readFile(path, 'utf8')
    const id = name.replace(/\.(sql|ts)$/, '')

    if (ext === 'sql') {
      const isTransactional = !contents
        .trimStart()
        .startsWith(NO_TRANSACTION_MARKER)
      migrations.push({
        id,
        checksum: checksumOf(contents),
        isTransactional,
        up: async (client) => {
          if (isTransactional) {
            await client.query(contents)
            return
          }
          // Statements sent in one query run as one implicit
          // transaction, which e.g. CREATE INDEX CONCURRENTLY refuses
          for (const statement of splitStatements(contents)) {
            await client.query(statement)
          }
        }
      })
    } else {
      migrations.push({
        id,
        checksum: checksumOf(contents),
        isTransactional: true,
        up: async (client) => {
          const mod = (await import(pathToFileURL(path).href)) as {
            default?: (client: MigrationClient) => Promise<void>
          }
          if (typeof mod.default !== 'function') {
            throw new Error(
              `${name} must default-export an async function`
            )
          }
          await mod.default(client)
        }
      })
    }
  }
  return migrations
}

export type RunResult = {
  applied: { id: string; durationMs: number }[]
  everyDeploy: {
    name: string
    durationMs: number
    message?: string
  }[]
}

type RunOptions = {
  client: MigrationClient
  migrations: Migration[]
  everyDeploySteps: EveryDeployStep[]
  /** Ordered version of the steps' definitions (see every-deploy.ts) */
  everyDeployRevision: number
  isPreview?: boolean
  appVersion?: string
  log?: (message: string) => void
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

/**
 * Applies pending migrations then every-deploy steps under the lock.
 * Throws (after releasing the lock) on the first failure.
 */
export async function runMigrations({
  client,
  migrations,
  everyDeploySteps,
  everyDeployRevision,
  isPreview = false,
  appVersion,
  log = console.log,
  now = Date.now,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
}: RunOptions): Promise<RunResult> {
  const result: RunResult = { applied: [], everyDeploy: [] }

  await client.query('SELECT pg_advisory_lock($1)', [
    MIGRATION_LOCK_ID
  ])
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  id          TEXT PRIMARY KEY,
  checksum    TEXT NOT NULL,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_ms INTEGER NOT NULL,
  app_version TEXT
)`)
    await client.query(`CREATE TABLE IF NOT EXISTS schema_every_deploy (
  id          BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  revision    INTEGER NOT NULL,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  app_version TEXT
)`)

    // Read only after taking the lock, so a build that waited sees
    // what the other one applied
    const { rows } = await client.query(
      'SELECT id, checksum FROM schema_migrations'
    )
    const applied = new Map(
      rows.map((row) => [String(row.id), String(row.checksum)])
    )
    const { rows: everyDeployRows } = await client.query(
      'SELECT revision FROM schema_every_deploy'
    )
    const appliedRevision = everyDeployRows[0]
      ? Number(everyDeployRows[0].revision)
      : undefined

    // An older checkout's every-deploy SQL would overwrite newer
    // functions and CHECKs while newer code is still live
    const fileIds = new Set(migrations.map(({ id }) => id))
    const unknown = [...applied.keys()].filter(
      (id) => !fileIds.has(id)
    )
    if (unknown.length) {
      const ids = unknown.join(', ')
      throw new Error(
        isPreview
          ? `This database has migrations this checkout lacks (${ids}): merge main into this branch, or reset the preview branch, and redeploy.`
          : `This database has migrations this checkout lacks (${ids}): it was built from an older commit. Deploy a newer commit, or use Vercel's Instant Rollback, which doesn't rebuild.`
      )
    }
    // Same for definitions changed with no migration, which the
    // checks above can't see
    if (
      appliedRevision !== undefined &&
      appliedRevision > everyDeployRevision
    ) {
      const revisions = `revision ${appliedRevision}, this checkout has ${everyDeployRevision}`
      throw new Error(
        isPreview
          ? `This database has newer every-deploy definitions (${revisions}): merge main into this branch, or reset the preview branch, and redeploy.`
          : `This database has newer every-deploy definitions (${revisions}): it was built from an older commit. Deploy a newer commit, or use Vercel's Instant Rollback, which doesn't rebuild.`
      )
    }

    const mismatched = migrations.filter(
      ({ id, checksum }) =>
        applied.has(id) && applied.get(id) !== checksum
    )
    if (mismatched.length) {
      const ids = mismatched.map(({ id }) => id).join(', ')
      throw new Error(
        isPreview
          ? `Checksum mismatch for ${ids}: the migration was edited after this preview branch applied it. Reset the preview branch (Neon console → Reset from parent, or delete it) and redeploy.`
          : `Checksum mismatch for ${ids}: a shipped migration was edited. Restore the file and put the change in a new migration.`
      )
    }

    const inTransaction = (label: string, run: () => Promise<void>) =>
      runInLockTimedTransaction({ client, label, log, sleep, run })

    for (const migration of migrations) {
      if (applied.has(migration.id)) continue
      const startedAt = now()
      let durationMs = 0
      const apply = async () => {
        await migration.up(client)
        durationMs = now() - startedAt
        await client.query(
          'INSERT INTO schema_migrations (id, checksum, duration_ms, app_version) VALUES ($1, $2, $3, $4)',
          [
            migration.id,
            migration.checksum,
            durationMs,
            appVersion ?? null
          ]
        )
      }
      try {
        // A no-transaction file's statements each commit on their
        // own, so it can't be retried whole, and holds each lock only
        // for one statement
        if (migration.isTransactional) {
          await inTransaction(migration.id, apply)
        } else {
          await apply()
        }
      } catch (error) {
        throw new Error(
          `Migration ${migration.id} failed: ${errorMessage(error)}`,
          { cause: error }
        )
      }
      result.applied.push({ id: migration.id, durationMs })
      log(`✅ ${migration.id} (${durationMs}ms)`)
    }
    if (!result.applied.length) log('No pending migrations.')

    // One transaction with the revision they're recorded under: a
    // step failing partway must not leave newer definitions behind
    // under the older revision, which an older checkout would pass
    await inTransaction('Every-deploy steps', async () => {
      result.everyDeploy = []
      for (const step of everyDeploySteps) {
        const startedAt = now()
        let message: string | void
        try {
          message = await step.run(client)
        } catch (error) {
          throw new Error(
            `Every-deploy step ${step.name} failed: ${errorMessage(error)}`,
            { cause: error }
          )
        }
        const durationMs = now() - startedAt
        result.everyDeploy.push({
          name: step.name,
          durationMs,
          message: message || undefined
        })
      }
      await client.query(
        `INSERT INTO schema_every_deploy (id, revision, app_version)
VALUES (true, $1, $2)
ON CONFLICT (id) DO UPDATE SET revision = EXCLUDED.revision,
  applied_at = now(), app_version = EXCLUDED.app_version`,
        [everyDeployRevision, appVersion ?? null]
      )
    })
    // Logged only once committed, so a rolled-back step isn't shown ✅
    for (const { name, durationMs, message } of result.everyDeploy) {
      log(`✅ ${name} (${durationMs}ms)`)
      if (message) log(message)
    }
  } finally {
    await client
      .query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID])
      .catch(() => {})
  }
  return result
}

/**
 * Runs `run` in a transaction whose lock waits are bounded by
 * LOCK_TIMEOUT, rolling back and retrying it whole when one times
 * out or it's picked as a deadlock victim. Any other error, or the
 * last attempt's, rolls back and is rethrown.
 */
async function runInLockTimedTransaction({
  client,
  label,
  log,
  sleep,
  run
}: {
  client: MigrationClient
  label: string
  log: (message: string) => void
  sleep: (ms: number) => Promise<void>
  run: () => Promise<void>
}): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    await client.query('BEGIN')
    try {
      await client.query(`SET LOCAL lock_timeout = '${LOCK_TIMEOUT}'`)
      await run()
      await client.query('COMMIT')
      return
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {})
      if (!isLockConflict(error) || attempt === LOCK_RETRY_ATTEMPTS) {
        throw error
      }
      log(
        `⏳ ${label} waited on a table lock in use; retrying (${attempt}/${LOCK_RETRY_ATTEMPTS - 1})`
      )
      await sleep(LOCK_RETRY_DELAY_MS * attempt)
    }
  }
}

/** A lock timeout or deadlock, here or as a wrapped `cause`. */
function isLockConflict(error: unknown): boolean {
  for (let e = error; e instanceof Error; e = e.cause) {
    const { code } = e as Error & { code?: unknown }
    if (typeof code === 'string' && LOCK_CONFLICT_CODES.has(code)) {
      return true
    }
  }
  return false
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
