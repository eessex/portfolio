/**
 * @jest-environment node
 */
import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import {
  checksumOf,
  decideRun,
  directHost,
  loadMigrations,
  type Migration,
  type MigrationClient,
  NOT_CONNECTED_MESSAGE,
  runMigrations,
  splitStatements
} from './runner'

const PROD_URL =
  'postgres://u:p@ep-prod-123.us-east-2.aws.neon.tech/db'
const PROD_POOLED_URL =
  'postgres://u:p@ep-prod-123-pooler.us-east-2.aws.neon.tech/db'
const BRANCH_URL =
  'postgres://u:p@ep-branch-456.us-east-2.aws.neon.tech/db'
const PROD_HOST = 'ep-prod-123.us-east-2.aws.neon.tech'

/**
 * A client that records queries and serves `applied` rows and the
 * recorded every-deploy revision.
 */
function mockClient(
  applied: { id: string; checksum: string }[] = [],
  everyDeployRevision?: number
) {
  const queries: string[] = []
  const client: MigrationClient = {
    query: jest.fn(async (text: string) => {
      queries.push(text)
      if (text.startsWith('SELECT id, checksum')) {
        return { rows: applied }
      }
      if (text.startsWith('SELECT revision')) {
        return {
          rows:
            everyDeployRevision === undefined
              ? []
              : [{ revision: everyDeployRevision }]
        }
      }
      return { rows: [] }
    })
  }
  return { client, queries }
}

function migration(
  id: string,
  overrides: Partial<Migration> = {}
): Migration {
  return {
    id,
    checksum: `sum-${id}`,
    isTransactional: true,
    up: jest.fn().mockResolvedValue(undefined),
    ...overrides
  }
}

const defaults = {
  everyDeployRevision: 2,
  log: () => {},
  sleep: async () => {}
}

/** A Postgres error with its SQLSTATE, as the driver throws it. */
function pgError(message: string, code: string) {
  return Object.assign(new Error(message), { code })
}

describe('directHost', () => {
  it('drops the pooler suffix', () => {
    expect(directHost('ep-x-pooler.neon.tech')).toBe('ep-x.neon.tech')
    expect(directHost('ep-x.neon.tech')).toBe('ep-x.neon.tech')
  })
})

describe('decideRun', () => {
  it('stops with a plain message when no database is connected', () => {
    expect(decideRun({})).toEqual({
      isRun: false,
      isError: true,
      message: NOT_CONNECTED_MESSAGE
    })
  })

  it('runs on production, preferring the unpooled URL', () => {
    expect(
      decideRun({
        VERCEL_ENV: 'production',
        DATABASE_URL: PROD_POOLED_URL,
        DATABASE_URL_UNPOOLED: PROD_URL
      })
    ).toEqual({ isRun: true, url: PROD_URL, isPreview: false })
  })

  it('stops when the unpooled and pooled URLs are different databases', () => {
    expect(
      decideRun({
        DATABASE_URL: PROD_POOLED_URL,
        DATABASE_URL_UNPOOLED: BRANCH_URL
      })
    ).toEqual({
      isRun: false,
      isError: true,
      message: expect.stringMatching(
        /^DATABASE_URL_UNPOOLED \(ep-branch-456\.us-east-2\.aws\.neon\.tech:5432\/db\) and DATABASE_URL \(ep-prod-123\.us-east-2\.aws\.neon\.tech:5432\/db\) point at different databases/
      )
    })
  })

  it.each([
    ['database', `postgres://u:p@${PROD_HOST}/other`],
    ['port', `postgres://u:p@${PROD_HOST}:6543/db`]
  ])(
    'stops when the URLs share a host but not a %s',
    (_, unpooled) => {
      expect(
        decideRun({
          DATABASE_URL: PROD_POOLED_URL,
          DATABASE_URL_UNPOOLED: unpooled
        })
      ).toMatchObject({ isRun: false, isError: true })
    }
  )

  it('treats differently cased hosts and an explicit 5432 as the same database', () => {
    expect(
      decideRun({
        DATABASE_URL:
          'postgres://u:p@EP-PROD-123-POOLER.US-EAST-2.AWS.NEON.TECH/db',
        DATABASE_URL_UNPOOLED: `postgres://u:p@${PROD_HOST}:5432/db`
      })
    ).toMatchObject({ isRun: true })
  })

  it('skips a preview whose uppercase host is the production host', () => {
    expect(
      decideRun({
        VERCEL_ENV: 'preview',
        MIGRATE_PREVIEWS: '1',
        DATABASE_URL: `postgres://u:p@${PROD_HOST.toUpperCase()}/db`,
        PRODUCTION_DATABASE_HOST: PROD_HOST
      })
    ).toMatchObject({
      isRun: false,
      isError: false,
      message: expect.stringContaining('is the production host')
    })
  })

  it('accepts a pooled and direct URL of the same database', () => {
    expect(
      decideRun({
        DATABASE_URL: PROD_URL,
        DATABASE_URL_UNPOOLED: PROD_URL
      })
    ).toMatchObject({ isRun: true, url: PROD_URL })
  })

  it.each([
    ['a connection string', PROD_URL],
    ['a URL with a scheme', `https://${PROD_HOST}`],
    ['a host and port', `${PROD_HOST}:5432`]
  ])(
    'stops a preview whose PRODUCTION_DATABASE_HOST is %s',
    (_, value) => {
      expect(
        decideRun({
          VERCEL_ENV: 'preview',
          MIGRATE_PREVIEWS: '1',
          DATABASE_URL: PROD_POOLED_URL,
          PRODUCTION_DATABASE_HOST: value
        })
      ).toEqual({
        isRun: false,
        isError: true,
        message: expect.stringContaining(
          'PRODUCTION_DATABASE_HOST must be a bare hostname'
        )
      })
    }
  )

  it('accepts a pooled, padded or uppercase production host', () => {
    for (const value of [
      'ep-prod-123-pooler.us-east-2.aws.neon.tech',
      ` ${PROD_HOST}\n`,
      PROD_HOST.toUpperCase()
    ]) {
      expect(
        decideRun({
          VERCEL_ENV: 'preview',
          MIGRATE_PREVIEWS: '1',
          DATABASE_URL: PROD_POOLED_URL,
          PRODUCTION_DATABASE_HOST: value
        })
      ).toMatchObject({
        isRun: false,
        isError: false,
        message: expect.stringContaining('is the production host')
      })
    }
  })

  it('runs locally, turning a pooled URL into a direct one', () => {
    const decision = decideRun({ DATABASE_URL: PROD_POOLED_URL })
    expect(decision).toEqual({
      isRun: true,
      url: PROD_URL,
      isPreview: false
    })
  })

  it('skips previews unless switched on', () => {
    const decision = decideRun({
      VERCEL_ENV: 'preview',
      DATABASE_URL: BRANCH_URL,
      PRODUCTION_DATABASE_HOST: PROD_HOST
    })
    expect(decision).toMatchObject({ isRun: false, isError: false })
  })

  it('skips previews with no production host to compare against', () => {
    const decision = decideRun({
      VERCEL_ENV: 'preview',
      MIGRATE_PREVIEWS: '1',
      DATABASE_URL: BRANCH_URL
    })
    expect(decision).toMatchObject({ isRun: false, isError: false })
  })

  it('skips a preview pointing at the production host', () => {
    const decision = decideRun({
      VERCEL_ENV: 'preview',
      MIGRATE_PREVIEWS: '1',
      DATABASE_URL: PROD_POOLED_URL,
      PRODUCTION_DATABASE_HOST: PROD_HOST
    })
    expect(decision).toMatchObject({ isRun: false, isError: false })
  })

  it('runs a preview on its own branch', () => {
    expect(
      decideRun({
        VERCEL_ENV: 'preview',
        MIGRATE_PREVIEWS: '1',
        DATABASE_URL: BRANCH_URL,
        PRODUCTION_DATABASE_HOST: PROD_HOST
      })
    ).toEqual({ isRun: true, url: BRANCH_URL, isPreview: true })
  })
})

describe('checksumOf', () => {
  it('ignores CRLF vs LF', () => {
    expect(checksumOf('a\r\nb\r\n')).toBe(checksumOf('a\nb\n'))
  })
})

describe('splitStatements', () => {
  it('splits on top-level semicolons', () => {
    expect(splitStatements('SELECT 1; SELECT 2;\n')).toEqual([
      'SELECT 1',
      'SELECT 2'
    ])
  })

  it('keeps semicolons inside quotes, dollar quotes and comments', () => {
    const sql = [
      "INSERT INTO t VALUES ('a;b', 'it''s; fine');",
      'COMMENT ON TABLE t IS "x;y";',
      '-- a; comment',
      '/* block; comment */',
      'CREATE FUNCTION f() RETURNS int AS $body$ SELECT 1; $body$ LANGUAGE sql;',
      'DO $$ BEGIN PERFORM 1; END $$;',
      'DO $migration_1$ BEGIN PERFORM 1; END $migration_1$;'
    ].join('\n')
    expect(splitStatements(sql)).toEqual([
      "INSERT INTO t VALUES ('a;b', 'it''s; fine')",
      'COMMENT ON TABLE t IS "x;y"',
      '-- a; comment\n/* block; comment */\nCREATE FUNCTION f() RETURNS int AS $body$ SELECT 1; $body$ LANGUAGE sql',
      'DO $$ BEGIN PERFORM 1; END $$',
      'DO $migration_1$ BEGIN PERFORM 1; END $migration_1$'
    ])
  })

  it('keeps backslash-escaped quotes inside E strings', () => {
    expect(
      splitStatements(
        "INSERT INTO t VALUES (E'it\\'s; fine', e'a\\\\'); SELECT 2;"
      )
    ).toEqual([
      "INSERT INTO t VALUES (E'it\\'s; fine', e'a\\\\')",
      'SELECT 2'
    ])
  })

  it('treats a quote after an identifier ending in e as a plain string', () => {
    expect(splitStatements("SELECT name'x; y'; SELECT 2;")).toEqual([
      "SELECT name'x; y'",
      'SELECT 2'
    ])
  })

  it('skips semicolons in nested block comments', () => {
    expect(
      splitStatements(
        '/* outer; /* inner; */ still comment; */ SELECT 1; SELECT 2;'
      )
    ).toEqual([
      '/* outer; /* inner; */ still comment; */ SELECT 1',
      'SELECT 2'
    ])
  })

  it('treats a $ inside an identifier as part of the name, not a dollar quote', () => {
    expect(
      splitStatements(
        [
          'CREATE INDEX CONCURRENTLY idx$foo$ ON a(x);',
          'CREATE INDEX CONCURRENTLY idx_b ON b(y);',
          'CREATE TABLE é$x$ (y int);'
        ].join('\n')
      )
    ).toEqual([
      'CREATE INDEX CONCURRENTLY idx$foo$ ON a(x)',
      'CREATE INDEX CONCURRENTLY idx_b ON b(y)',
      'CREATE TABLE é$x$ (y int)'
    ])
  })

  it('still opens a dollar quote after a space, paren or operator', () => {
    expect(
      splitStatements(
        "SELECT $a$;$a$;SELECT ($$;$$);SELECT 'x'||$b$;$b$;SELECT 1"
      )
    ).toEqual([
      'SELECT $a$;$a$',
      'SELECT ($$;$$)',
      "SELECT 'x'||$b$;$b$",
      'SELECT 1'
    ])
  })

  it('opens a dollar quote with a non-ASCII tag', () => {
    expect(splitStatements('SELECT $é$;$é$; SELECT 2')).toEqual([
      'SELECT $é$;$é$',
      'SELECT 2'
    ])
  })

  it('drops comment-only chunks', () => {
    expect(splitStatements('SELECT 1;\n-- trailing note\n')).toEqual([
      'SELECT 1'
    ])
  })
})

describe('loadMigrations', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'migrations-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('returns none for a missing directory', async () => {
    expect(await loadMigrations(join(dir, 'nope'))).toEqual([])
  })

  it('loads files in order with checksums and transaction flags', async () => {
    await writeFile(join(dir, '0002_b.sql'), 'SELECT 2;')
    await writeFile(
      join(dir, '0001_a.sql'),
      '-- migrate:no-transaction\nSELECT 1;'
    )
    await writeFile(join(dir, '.gitkeep'), '')

    const migrations = await loadMigrations(dir)

    expect(migrations.map(({ id }) => id)).toEqual([
      '0001_a',
      '0002_b'
    ])
    expect(migrations[0]?.isTransactional).toBe(false)
    expect(migrations[1]?.isTransactional).toBe(true)
    expect(migrations[1]?.checksum).toBe(checksumOf('SELECT 2;'))

    const { client } = mockClient()
    await migrations[1]?.up(client)
    expect(client.query).toHaveBeenCalledWith('SELECT 2;')
  })

  it('runs a no-transaction file one statement at a time', async () => {
    await writeFile(
      join(dir, '0001_indexes.sql'),
      [
        '-- migrate:no-transaction',
        'CREATE INDEX CONCURRENTLY idx_a ON a(x);',
        'CREATE INDEX CONCURRENTLY idx_b ON b(y);',
        ''
      ].join('\n')
    )
    const [indexes] = await loadMigrations(dir)

    const { client } = mockClient()
    await indexes?.up(client)
    expect(jest.mocked(client.query).mock.calls).toEqual([
      [
        '-- migrate:no-transaction\nCREATE INDEX CONCURRENTLY idx_a ON a(x)'
      ],
      ['CREATE INDEX CONCURRENTLY idx_b ON b(y)']
    ])
  })

  it('refuses two files with the same number', async () => {
    await writeFile(join(dir, '0003_a.sql'), '')
    await writeFile(join(dir, '0003_b.sql'), '')
    await expect(loadMigrations(dir)).rejects.toThrow(
      'Two migrations share number 0003'
    )
  })

  it('refuses a misnamed file', async () => {
    await writeFile(join(dir, 'add-column.sql'), '')
    await expect(loadMigrations(dir)).rejects.toThrow(
      'Unexpected file in migrations/: add-column.sql'
    )
  })
})

/**
 * Loads and runs `dir`'s migrations in a child process with the same
 * `node --import tsx` entry as `pnpm migrate`, since Jest's module
 * system would stand in for the runner's dynamic import of a .ts file.
 */
async function loadAndRunWithTsx(dir: string) {
  const script = `
    const { loadMigrations } = require('./scripts/migrate/runner.ts')
    loadMigrations(process.env.MIGRATIONS_DIR)
      .then(async (migrations) => {
        const texts = []
        const client = {
          query: async (text) => (texts.push(text), { rows: [] })
        }
        for (const migration of migrations) await migration.up(client)
        console.log(JSON.stringify({
          ids: migrations.map(({ id }) => id),
          texts
        }))
      })
      .catch((error) => {
        console.log(JSON.stringify({ error: error.message }))
      })
  `
  const { stdout } = await promisify(execFile)(
    process.execPath,
    ['--import', 'tsx', '-e', script],
    {
      cwd: process.cwd(),
      env: { ...process.env, MIGRATIONS_DIR: dir }
    }
  )
  return JSON.parse(stdout) as {
    ids?: string[]
    texts?: string[]
    error?: string
  }
}

describe('loadMigrations under tsx', () => {
  it('loads and runs the shipped baseline migration', async () => {
    const { ids, texts, error } = await loadAndRunWithTsx(
      join(process.cwd(), 'migrations')
    )
    expect(error).toBeUndefined()
    expect(ids?.[0]).toBe('0001_baseline')
    expect(texts).toContainEqual(
      expect.stringMatching(/^CREATE TABLE IF NOT EXISTS projects/)
    )
  }, 30_000)

  it('refuses a .ts migration with no default export', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'migrations-'))
    try {
      await writeFile(
        join(dir, '0001_named.ts'),
        'export async function up() {}\n'
      )
      expect(await loadAndRunWithTsx(dir)).toEqual({
        error: '0001_named.ts must default-export an async function'
      })
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  }, 30_000)
})

describe('runMigrations', () => {
  it('applies pending files in order, each in a transaction, under the lock', async () => {
    const { client, queries } = mockClient([
      { id: '0001_a', checksum: 'sum-0001_a' }
    ])
    const first = migration('0001_a')
    const second = migration('0002_b')
    const third = migration('0003_c')

    const result = await runMigrations({
      client,
      migrations: [first, second, third],
      everyDeploySteps: [],
      appVersion: '1.2.0',
      ...defaults
    })

    expect(first.up).not.toHaveBeenCalled()
    expect(result.applied.map(({ id }) => id)).toEqual([
      '0002_b',
      '0003_c'
    ])
    expect(queries[0]).toBe('SELECT pg_advisory_lock($1)')
    expect(queries.at(-1)).toBe('SELECT pg_advisory_unlock($1)')
    expect(
      queries.filter((q) =>
        /^(BEGIN|COMMIT|INSERT INTO schema_migrations)/.test(q)
      )
    ).toEqual([
      'BEGIN',
      expect.stringMatching(/^INSERT/),
      'COMMIT',
      'BEGIN',
      expect.stringMatching(/^INSERT/),
      'COMMIT',
      // the every-deploy transaction
      'BEGIN',
      'COMMIT'
    ])
    expect(client.query).toHaveBeenCalledWith(
      expect.stringMatching(/^INSERT INTO schema_migrations/),
      ['0002_b', 'sum-0002_b', expect.any(Number), '1.2.0']
    )
  })

  it('runs a no-transaction file without BEGIN/COMMIT', async () => {
    const { client, queries } = mockClient()
    const noTransaction = migration('0001_a', {
      isTransactional: false,
      up: jest.fn(async () => {
        expect(queries).not.toContain('BEGIN')
      })
    })
    await runMigrations({
      client,
      migrations: [noTransaction],
      everyDeploySteps: [],
      ...defaults
    })
    expect(noTransaction.up).toHaveBeenCalled()
    // just the every-deploy transaction, after the file
    expect(queries.filter((q) => q === 'BEGIN')).toHaveLength(1)
  })

  it('stops before running anything on a checksum mismatch', async () => {
    const { client } = mockClient([
      { id: '0001_a', checksum: 'edited' }
    ])
    const pending = migration('0002_b')

    await expect(
      runMigrations({
        client,
        migrations: [migration('0001_a'), pending],
        everyDeploySteps: [],
        ...defaults
      })
    ).rejects.toThrow('Checksum mismatch for 0001_a')
    expect(pending.up).not.toHaveBeenCalled()
    expect(client.query).toHaveBeenLastCalledWith(
      'SELECT pg_advisory_unlock($1)',
      expect.any(Array)
    )
  })

  it('tells a preview to reset its branch on a checksum mismatch', async () => {
    const { client } = mockClient([
      { id: '0001_a', checksum: 'edited' }
    ])
    await expect(
      runMigrations({
        client,
        migrations: [migration('0001_a')],
        everyDeploySteps: [],
        isPreview: true,
        ...defaults
      })
    ).rejects.toThrow('Reset the preview branch')
  })

  it('rolls back a failing file and runs nothing after it', async () => {
    const { client, queries } = mockClient()
    const failing = migration('0001_a', {
      up: jest.fn().mockRejectedValue(new Error('syntax error'))
    })
    const after = migration('0002_b')
    const step = { name: 'step', run: jest.fn() }

    await expect(
      runMigrations({
        client,
        migrations: [failing, after],
        everyDeploySteps: [step],
        ...defaults
      })
    ).rejects.toThrow('Migration 0001_a failed: syntax error')
    expect(queries).toContain('ROLLBACK')
    expect(queries).not.toContain('COMMIT')
    expect(after.up).not.toHaveBeenCalled()
    expect(step.run).not.toHaveBeenCalled()
    expect(queries.at(-1)).toBe('SELECT pg_advisory_unlock($1)')
  })

  it('runs every-deploy steps after migrations, even with none pending', async () => {
    const { client } = mockClient([
      { id: '0001_a', checksum: 'sum-0001_a' }
    ])
    const order: string[] = []
    const result = await runMigrations({
      client,
      migrations: [migration('0001_a')],
      everyDeploySteps: [
        { name: 'one', run: async () => void order.push('one') },
        { name: 'two', run: async () => void order.push('two') }
      ],
      ...defaults
    })
    expect(order).toEqual(['one', 'two'])
    expect(result.everyDeploy.map(({ name }) => name)).toEqual([
      'one',
      'two'
    ])
  })

  it('passes every-deploy options to each step', async () => {
    const { client } = mockClient()
    const step = { name: 'ensureSetupCode', run: jest.fn() }

    await runMigrations({
      client,
      migrations: [],
      everyDeploySteps: [step],
      ...defaults,
      everyDeployOptions: { isSetupCodeRotated: true }
    })

    expect(step.run).toHaveBeenCalledWith(client, {
      isSetupCodeRotated: true
    })
  })

  it('logs a step’s returned banner only after it commits', async () => {
    const { client } = mockClient()
    const logged: string[] = []
    const step = {
      name: 'ensureSetupCode',
      run: jest.fn().mockResolvedValue('=== banner ===')
    }

    await runMigrations({
      client,
      migrations: [],
      everyDeploySteps: [step],
      ...defaults,
      now: () => 0,
      log: (message) => void logged.push(message)
    })

    expect(logged).toEqual([
      'No pending migrations.',
      '✅ ensureSetupCode (0ms)',
      '=== banner ==='
    ])
  })

  it('logs nothing extra for a step that returns no banner', async () => {
    const { client } = mockClient()
    const logged: string[] = []
    const step = { name: 'syncCheckConstraints', run: jest.fn() }

    await runMigrations({
      client,
      migrations: [],
      everyDeploySteps: [step],
      ...defaults,
      now: () => 0,
      log: (message) => void logged.push(message)
    })

    expect(logged).toEqual([
      'No pending migrations.',
      '✅ syncCheckConstraints (0ms)'
    ])
  })

  it('names a failing every-deploy step', async () => {
    const { client } = mockClient()
    await expect(
      runMigrations({
        client,
        migrations: [],
        everyDeploySteps: [
          {
            name: 'syncCheckConstraints',
            run: jest.fn().mockRejectedValue(new Error('boom'))
          }
        ],
        ...defaults
      })
    ).rejects.toThrow('Every-deploy step syncCheckConstraints failed')
  })

  it('rolls back every step and the revision when a later step fails', async () => {
    const { client, queries } = mockClient([], 1)
    const first = {
      name: 'setupJsonbFunctions',
      run: jest.fn(async (c: MigrationClient) => {
        await c.query('CREATE OR REPLACE FUNCTION f()')
      })
    }
    const failing = {
      name: 'seedBuiltInPublisher',
      run: jest.fn().mockRejectedValue(new Error('boom'))
    }
    const logged: string[] = []

    await expect(
      runMigrations({
        client,
        migrations: [],
        everyDeploySteps: [first, failing],
        ...defaults,
        log: (message) => void logged.push(message)
      })
    ).rejects.toThrow('Every-deploy step seedBuiltInPublisher failed')

    const begin = queries.indexOf('BEGIN')
    expect(begin).toBeGreaterThan(-1)
    expect(
      queries.indexOf('CREATE OR REPLACE FUNCTION f()')
    ).toBeGreaterThan(begin)
    expect(queries.slice(begin)).toContain('ROLLBACK')
    expect(queries).not.toContain('COMMIT')
    expect(queries).not.toContainEqual(
      expect.stringMatching(/^INSERT INTO schema_every_deploy/)
    )
    expect(logged).not.toContainEqual(
      expect.stringContaining('setupJsonbFunctions')
    )
    expect(queries.at(-1)).toBe('SELECT pg_advisory_unlock($1)')
  })

  it.each([
    [false, 'built from an older commit'],
    [true, 'merge main into this branch']
  ])(
    'refuses a checkout missing applied migrations (preview: %s), running nothing',
    async (isPreview, hint) => {
      const { client, queries } = mockClient([
        { id: '0001_a', checksum: 'sum-0001_a' },
        { id: '0009_future', checksum: 'x' }
      ])
      const pending = migration('0002_b')
      const step = { name: 'step', run: jest.fn() }

      await expect(
        runMigrations({
          client,
          migrations: [migration('0001_a'), pending],
          everyDeploySteps: [step],
          isPreview,
          ...defaults
        })
      ).rejects.toThrow(
        new RegExp(
          `migrations this checkout lacks \\(0009_future\\).*${hint}`
        )
      )
      expect(pending.up).not.toHaveBeenCalled()
      expect(step.run).not.toHaveBeenCalled()
      expect(queries).not.toContain('BEGIN')
      expect(queries.at(-1)).toBe('SELECT pg_advisory_unlock($1)')
    }
  )

  it('bounds each migration transaction’s lock waits', async () => {
    const { client, queries } = mockClient()
    await runMigrations({
      client,
      migrations: [migration('0001_a')],
      everyDeploySteps: [],
      ...defaults
    })
    expect(queries[queries.indexOf('BEGIN') + 1]).toBe(
      "SET LOCAL lock_timeout = '200ms'"
    )
  })

  it('retries a migration whole when a lock wait times out, recording it once', async () => {
    const { client, queries } = mockClient()
    // e.g. the baseline's no-op CREATE INDEX IF NOT EXISTS, which
    // still takes its table's SHARE lock
    const baseline = migration('0001_baseline', {
      up: jest
        .fn()
        .mockRejectedValueOnce(
          pgError('canceling statement due to lock timeout', '55P03')
        )
        .mockResolvedValue(undefined)
    })
    const after = migration('0002_b')
    const logged: string[] = []

    const result = await runMigrations({
      client,
      migrations: [baseline, after],
      everyDeploySteps: [],
      ...defaults,
      log: (message) => void logged.push(message)
    })

    expect(baseline.up).toHaveBeenCalledTimes(2)
    expect(result.applied.map(({ id }) => id)).toEqual([
      '0001_baseline',
      '0002_b'
    ])
    expect(
      queries.filter((q) =>
        q.startsWith('INSERT INTO schema_migrations')
      )
    ).toHaveLength(2)
    expect(
      queries
        .filter((q) => /^(BEGIN|ROLLBACK|COMMIT)$/.test(q))
        .slice(0, 4)
    ).toEqual(['BEGIN', 'ROLLBACK', 'BEGIN', 'COMMIT'])
    expect(logged).toContainEqual(
      '⏳ 0001_baseline waited on a table lock in use; retrying (1/9)'
    )
  })

  it('fails a migration after 10 lock timeouts, running nothing after it', async () => {
    const { client, queries } = mockClient()
    const stuck = migration('0001_a', {
      up: jest
        .fn()
        .mockRejectedValue(
          pgError('canceling statement due to lock timeout', '55P03')
        )
    })
    const after = migration('0002_b')
    await expect(
      runMigrations({
        client,
        migrations: [stuck, after],
        everyDeploySteps: [],
        ...defaults
      })
    ).rejects.toThrow(
      'Migration 0001_a failed: canceling statement due to lock timeout'
    )
    expect(stuck.up).toHaveBeenCalledTimes(10)
    expect(after.up).not.toHaveBeenCalled()
    expect(queries).not.toContain('COMMIT')
  })

  it('never retries a no-transaction migration, whose statements already committed', async () => {
    const { client, queries } = mockClient()
    const noTransaction = migration('0001_a', {
      isTransactional: false,
      up: jest
        .fn()
        .mockRejectedValue(
          pgError('canceling statement due to lock timeout', '55P03')
        )
    })
    await expect(
      runMigrations({
        client,
        migrations: [noTransaction],
        everyDeploySteps: [],
        ...defaults
      })
    ).rejects.toThrow('Migration 0001_a failed')
    expect(noTransaction.up).toHaveBeenCalledTimes(1)
    expect(queries).not.toContain('BEGIN')
  })

  it('retries the every-deploy transaction when a lock wait times out', async () => {
    const { client, queries } = mockClient()
    const step = {
      name: 'syncCheckConstraints',
      run: jest
        .fn()
        .mockRejectedValueOnce(
          pgError('canceling statement due to lock timeout', '55P03')
        )
        .mockResolvedValue(undefined)
    }
    const sleep = jest.fn(async () => {})
    const logged: string[] = []

    const result = await runMigrations({
      client,
      migrations: [],
      everyDeploySteps: [step],
      ...defaults,
      sleep,
      log: (message) => void logged.push(message)
    })

    expect(step.run).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledTimes(1)
    expect(
      queries.filter((q) => /^(BEGIN|ROLLBACK|COMMIT)$/.test(q))
    ).toEqual(['BEGIN', 'ROLLBACK', 'BEGIN', 'COMMIT'])
    expect(result.everyDeploy.map(({ name }) => name)).toEqual([
      'syncCheckConstraints'
    ])
    expect(logged).toContainEqual(
      expect.stringContaining('retrying (1/9)')
    )
  })

  it('retries after being picked as a deadlock victim', async () => {
    const { client } = mockClient()
    const step = {
      name: 'setupSlugTriggers',
      run: jest
        .fn()
        .mockRejectedValueOnce(pgError('deadlock detected', '40P01'))
        .mockResolvedValue(undefined)
    }
    await runMigrations({
      client,
      migrations: [],
      everyDeploySteps: [step],
      ...defaults
    })
    expect(step.run).toHaveBeenCalledTimes(2)
  })

  it('gives up after 10 lock timeouts, committing nothing', async () => {
    const { client, queries } = mockClient()
    const step = {
      name: 'syncCheckConstraints',
      run: jest
        .fn()
        .mockRejectedValue(
          pgError('canceling statement due to lock timeout', '55P03')
        )
    }
    await expect(
      runMigrations({
        client,
        migrations: [],
        everyDeploySteps: [step],
        ...defaults
      })
    ).rejects.toThrow(
      'Every-deploy step syncCheckConstraints failed: canceling statement due to lock timeout'
    )
    expect(step.run).toHaveBeenCalledTimes(10)
    expect(queries).not.toContain('COMMIT')
    expect(queries.at(-1)).toBe('SELECT pg_advisory_unlock($1)')
  })

  it('does not retry other every-deploy failures', async () => {
    const { client } = mockClient()
    const step = {
      name: 'setupJsonbFunctions',
      run: jest
        .fn()
        .mockRejectedValue(pgError('syntax error', '42601'))
    }
    await expect(
      runMigrations({
        client,
        migrations: [],
        everyDeploySteps: [step],
        ...defaults
      })
    ).rejects.toThrow('syntax error')
    expect(step.run).toHaveBeenCalledTimes(1)
  })

  it('records the every-deploy revision after the steps', async () => {
    const { client, queries } = mockClient([], 1)
    await runMigrations({
      client,
      migrations: [],
      everyDeploySteps: [{ name: 'step', run: jest.fn() }],
      appVersion: '1.2.0',
      ...defaults
    })
    expect(client.query).toHaveBeenCalledWith(
      expect.stringMatching(/^INSERT INTO schema_every_deploy/),
      [2, '1.2.0']
    )
    // in the steps' transaction
    expect(queries.slice(-5)).toEqual([
      'BEGIN',
      "SET LOCAL lock_timeout = '200ms'",
      expect.stringMatching(/^INSERT INTO schema_every_deploy/),
      'COMMIT',
      'SELECT pg_advisory_unlock($1)'
    ])
  })

  it.each([
    [false, 'built from an older commit'],
    [true, 'merge main into this branch']
  ])(
    'refuses a checkout with older every-deploy definitions (preview: %s), running nothing',
    async (isPreview, hint) => {
      const { client, queries } = mockClient([], 3)
      const pending = migration('0001_a')
      const step = { name: 'step', run: jest.fn() }

      await expect(
        runMigrations({
          client,
          migrations: [pending],
          everyDeploySteps: [step],
          isPreview,
          ...defaults
        })
      ).rejects.toThrow(
        new RegExp(`revision 3, this checkout has 2\\).*${hint}`)
      )
      expect(pending.up).not.toHaveBeenCalled()
      expect(step.run).not.toHaveBeenCalled()
      expect(queries.at(-1)).toBe('SELECT pg_advisory_unlock($1)')
    }
  )

  it('runs a checkout at the recorded every-deploy revision', async () => {
    const { client } = mockClient([], 2)
    const step = { name: 'step', run: jest.fn() }
    await runMigrations({
      client,
      migrations: [],
      everyDeploySteps: [step],
      ...defaults
    })
    expect(step.run).toHaveBeenCalled()
  })
})
