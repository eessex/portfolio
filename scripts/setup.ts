/**
 * Interactive first-run setup for a new instance:
 *
 *   1. Copies .env.example -> .env (if .env doesn't exist yet)
 *   2. Generates AUTH_SECRET and writes it to .env (if unset)
 *   3. Prompts for the Postgres DATABASE_URL (with doc links)
 *   4. Tests the connection, re-prompting until it succeeds
 *   5. Creates the database schema (idempotent)
 *   6. Creates the first admin user (only if none exists)
 *
 * Run with: pnpm run setup
 * (`run` is required — bare `pnpm setup` invokes pnpm's own builtin
 * setup command instead of this script.)
 *
 * Safe to re-run: every step checks current state before acting, and a
 * DATABASE_URL is only persisted once it has connected successfully, so
 * a failed run never leaves bad values behind.
 *
 * Admin details can be supplied non-interactively via SETUP_ADMIN_NAME
 * / SETUP_ADMIN_EMAIL / SETUP_ADMIN_PASSWORD (useful for automation).
 */
import { randomBytes } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  readFileSync,
  writeFileSync
} from 'node:fs'
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'

import { neon } from '@neondatabase/serverless'
import { z } from 'zod'

const ENV_PATH = '.env'
const ENV_EXAMPLE_PATH = '.env.example'

const DB_DOC_LINKS = [
  'Where to find your Postgres connection string:',
  '  • Neon:            https://neon.tech/docs/connect/connect-from-any-app',
  '  • Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres',
  'It looks like: postgres://USER:PASSWORD@HOST/DB?sslmode=require'
].join('\n')

const adminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type AdminInput = z.infer<typeof adminSchema>

// Prompts

// A single, shared readline interface is reused for every prompt.
// Creating and closing one per prompt leaves the TTY stdin paused, so
// later prompts stop receiving input and appear to hang.
let rl: ReturnType<typeof createInterface> | null = null
let muted = false

function getReadline(): ReturnType<typeof createInterface> {
  if (rl) return rl
  rl = createInterface({ input: stdin, output: stdout })
  // @ts-expect-error _writeToOutput is an internal readline method
  const write = rl._writeToOutput.bind(rl)
  // @ts-expect-error _writeToOutput is an internal readline method
  rl._writeToOutput = (chunk: string) => {
    // Suppress echo while `muted` so passwords aren't shown as typed.
    if (!muted) write(chunk)
  }
  return rl
}

function closeReadline(): void {
  rl?.close()
  rl = null
}

function ask(
  query: string,
  { hidden = false } = {}
): Promise<string> {
  return new Promise((resolve) => {
    const readline = getReadline()
    muted = false
    readline.question(query, (answer) => {
      muted = false
      if (hidden) stdout.write('\n')
      resolve(answer.trim())
    })
    muted = hidden
  })
}

// .env file helpers

function readEnv(): string {
  return existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : ''
}

function getEnvValue(content: string, key: string): string {
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'))
  if (!match) return ''
  return match[1].trim().replace(/^['"]|['"]$/g, '')
}

/** Upsert an uncommented KEY=value line, preserving the rest. */
function setEnvValue(key: string, value: string): void {
  const content = readEnv()
  const line = `${key}=${value}`
  const re = new RegExp(`^${key}=.*$`, 'm')
  const next = re.test(content)
    ? content.replace(re, line)
    : `${content}${content && !content.endsWith('\n') ? '\n' : ''}${line}\n`
  writeFileSync(ENV_PATH, next)
}

/** Load .env values into process.env without clobbering existing ones. */
function loadEnvIntoProcess(): void {
  for (const raw of readEnv().split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

// Steps

function ensureEnvFile(): void {
  if (existsSync(ENV_PATH)) {
    console.log('✅ Using existing .env')
    return
  }
  if (!existsSync(ENV_EXAMPLE_PATH)) {
    throw new Error('.env.example not found — cannot create .env')
  }
  copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH)
  console.log('✅ Created .env from .env.example')
}

function ensureAuthSecret(): void {
  if (getEnvValue(readEnv(), 'AUTH_SECRET')) {
    console.log('✅ AUTH_SECRET already set')
    return
  }
  setEnvValue('AUTH_SECRET', randomBytes(32).toString('base64'))
  console.log('✅ Generated AUTH_SECRET')
}

/** Returns an error message if the URL can't connect, else null. */
async function connectionError(url: string): Promise<string | null> {
  try {
    const sql = neon(url)
    await sql`SELECT 1`
    return null
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

async function ensureDatabaseUrl(): Promise<void> {
  const existing = getEnvValue(readEnv(), 'DATABASE_URL')
  if (existing) {
    stdout.write('• Testing existing DATABASE_URL… ')
    const error = await connectionError(existing)
    if (!error) {
      console.log('connected')
      process.env.DATABASE_URL = existing
      return
    }
    console.log(`failed\n  ${error}`)
  }

  console.log('\nEnter your Neon DATABASE_URL')
  console.log(`${DB_DOC_LINKS}\n`)
  for (;;) {
    const url = await ask('Postgres connection string: ')
    if (!url) {
      console.log('  A connection string is required.\n')
      continue
    }
    stdout.write('  Testing connection… ')
    const error = await connectionError(url)
    if (!error) {
      console.log('connected')
      setEnvValue('DATABASE_URL', url)
      process.env.DATABASE_URL = url
      console.log('✅ Saved DATABASE_URL to .env')
      return
    }
    console.log(`failed\n  ${error}\n  Please try again.\n`)
  }
}

async function promptAdmin(): Promise<AdminInput> {
  const env = {
    email: process.env.SETUP_ADMIN_EMAIL,
    name: process.env.SETUP_ADMIN_NAME,
    password: process.env.SETUP_ADMIN_PASSWORD
  }
  const nonInteractive = !!(env.email && env.name && env.password)

  // SETUP_ADMIN_* seed only the first attempt.
  let seed: Partial<typeof env> = env
  for (;;) {
    const email =
      seed.email ?? (await ask('Enter your email address: '))
    const name = seed.name ?? (await ask('Enter your name: '))
    const password =
      seed.password ??
      (await ask('Enter a password (min 8 characters): ', {
        hidden: true
      }))
    seed = {}

    const parsed = adminSchema.safeParse({ name, email, password })
    if (parsed.success) return parsed.data

    console.log('Please fix:')
    for (const issue of parsed.error.issues) {
      console.log(`  - ${issue.message}`)
    }
    console.log('')
    if (nonInteractive) {
      throw new Error('Invalid SETUP_ADMIN_* environment values.')
    }
  }
}

async function setupDatabase(): Promise<void> {
  // Imported dynamically: these modules read DATABASE_URL at import
  // time, so they must load only after ensureDatabaseUrl() has set it.
  const { createTables } = await import('@/seed/createTables')
  console.log('• Creating (or migrating) tables…')
  await createTables()

  const { countUsers } = await import('@/lib/users/data')
  const existing = await countUsers()
  if (existing > 0) {
    console.log(
      `✅ ${existing} user(s) already exist — skipping admin creation`
    )
    return
  }

  console.log('\nCreate a user account.')
  const admin = await promptAdmin()
  const { createUser } = await import('@/lib/users/create')
  await createUser(admin)
  console.log(`✅ Created admin ${admin.email}`)
}

async function main(): Promise<void> {
  console.log('Portfolio CMS setup\n')
  ensureEnvFile()
  ensureAuthSecret()
  await ensureDatabaseUrl()
  loadEnvIntoProcess()
  await setupDatabase()
  closeReadline()
  console.log('\nSetup complete. Start the app with: pnpm dev')
  console.log('Then log in at http://localhost:3000/login')
  process.exit(0)
}

main().catch((error) => {
  console.error('\nSetup failed:')
  console.error(error)
  process.exit(1)
})
