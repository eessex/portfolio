/**
 * Guided import of an old site's Mongo export into a freshly set up
 * fork (see docs/IMPORT_OLD_SITE.md).
 *
 *   pnpm run import-old-site --input <dir>
 *
 * Checks the setup (.env, a migrated and claimed database, storage),
 * runs `migrate-mongo --dry-run` and points at its report, asks before
 * writing, then runs the real import. The import never deletes or
 * overwrites, and a re-run only adds what's missing, so stopping
 * halfway is safe.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'

import { neon } from '@neondatabase/serverless'

import { storageAdapter } from '@/lib/storage'
import { IMAGE_PATH_PREFIX, publicUrl } from '@/lib/storage/keys'

import {
  checkDatabase,
  databaseHost,
  exportFiles
} from './import-old-site/preflight'
import type { Sql } from './migrate-mongo/plan'

const USAGE = 'Usage: pnpm run import-old-site --input <dir>'

async function confirm(question: string) {
  if (!process.stdin.isTTY) return false
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const answer = await rl.question(`${question} [y/N] `)
  rl.close()
  return /^y(es)?$/i.test(answer.trim())
}

function runMigrateMongo(input: string, isDryRun: boolean) {
  const args = [
    '--import',
    'tsx',
    path.join(__dirname, 'migrate-mongo.ts'),
    '--input',
    input,
    ...(isDryRun ? ['--dry-run'] : [])
  ]
  return new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', (code) => resolve(code ?? 1))
  })
}

async function main() {
  const args = process.argv.slice(2)
  const inputArg = args[args.indexOf('--input') + 1]
  if (
    !args.includes('--input') ||
    !inputArg ||
    inputArg.startsWith('--')
  ) {
    console.error(USAGE)
    return 1
  }
  const input = path.resolve(inputArg)

  console.info('Checking your setup…')
  const files = await exportFiles(input)
  if (!files.length) {
    console.error(
      `❌ ${input} has none of the export files (events.json, projects.json, …). Point --input at the folder you were sent.`
    )
    return 1
  }
  console.info(`  Export: ${files.join(', ')}`)

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error(
      "❌ DATABASE_URL isn't set. Add it to .env in this folder (docs/IMPORT_OLD_SITE.md, step 3)."
    )
    return 1
  }
  try {
    storageAdapter()
    publicUrl(IMAGE_PATH_PREFIX)
  } catch (err) {
    console.error(
      `❌ Image storage isn't set up: ${(err as Error).message}\n   Add BLOB_READ_WRITE_TOKEN to .env (docs/IMPORT_OLD_SITE.md, step 3).`
    )
    return 1
  }

  const { errors, warnings } = await checkDatabase(
    neon(databaseUrl) as Sql
  )
  console.info(`  Database: ${databaseHost(databaseUrl) ?? 'set'}`)
  for (const error of errors) console.error(`❌ ${error}`)
  if (errors.length) return 1
  for (const warning of warnings) console.warn(`⚠️  ${warning}`)

  console.info('\nStep 1 of 2: dry run (nothing is written)…\n')
  const dryRunCode = await runMigrateMongo(input, true)
  console.info(
    `\nRead the report above (also saved in ${path.join(input, 'reports')}).`
  )
  if (dryRunCode !== 0) {
    console.warn(
      '⚠️  The dry run found problems. Items listed under "Failed" will be left out. Send the report to the maintainer if you are unsure.'
    )
  }
  if (!(await confirm('Import into this site now?'))) {
    console.info('Stopped. Nothing was imported.')
    return dryRunCode
  }

  console.info('\nStep 2 of 2: importing…\n')
  const code = await runMigrateMongo(input, false)
  if (code !== 0) {
    console.error(
      '\n❌ Some items failed (see the report). Running this again retries only what is missing.'
    )
    return code
  }
  console.info(
    '\n✅ Imported. In Vercel, open Deployments and click Redeploy so the site shows the new content.\n   Then delete .env from this folder and keep the export folder private.'
  )
  return 0
}

main().then(
  (code) => (process.exitCode = code),
  (err) => {
    console.error(`❌ ${(err as Error).message}`)
    process.exitCode = 1
  }
)
