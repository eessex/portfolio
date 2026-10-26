import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { Client } from '@neondatabase/serverless'

import {
  EVERY_DEPLOY_REVISION,
  everyDeploySteps
} from '@/seed/every-deploy'

import {
  decideRun,
  loadMigrations,
  type RunDecision,
  runMigrations
} from './runner'

const MIGRATIONS_DIR = join(process.cwd(), 'migrations')

function appVersion(): string | undefined {
  try {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    ) as { version?: string }
    return pkg.version
  } catch {
    return undefined
  }
}

/**
 * Migrates the database `env` points at, unless `decideRun` says this
 * environment shouldn't. Shared by `pnpm migrate` and `pnpm run setup`.
 */
export async function migrateDatabase(
  env: Record<string, string | undefined>
): Promise<RunDecision> {
  const decision = decideRun(env)
  if (!decision.isRun) return decision

  const migrations = await loadMigrations(MIGRATIONS_DIR)
  const client = new Client(decision.url)
  await client.connect()
  try {
    await runMigrations({
      client,
      migrations,
      everyDeploySteps,
      everyDeployRevision: EVERY_DEPLOY_REVISION,
      isPreview: decision.isPreview,
      appVersion: appVersion()
    })
  } finally {
    await client.end()
  }
  return decision
}
