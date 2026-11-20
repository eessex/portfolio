/**
 * Exports the old site's Mongo collections into the folder that
 * `pnpm run import-old-site` reads (see docs/IMPORT_OLD_SITE.md).
 *
 *   MONGODB_URI='mongodb+srv://…/<db>' pnpm run export-old-site [--out <dir>] [--db <name>]
 *
 * Needs `mongoexport` (MongoDB Database Tools). Writes one
 * `--jsonArray` file per collection the import reads, checks each one
 * parses, and tries a few image URLs, since the import downloads every
 * image from the old storage. Only reads from Mongo. The folder holds
 * the site's full content (and any subscriber emails in it), so share
 * it privately and never commit it; `mongo-export/` is git-ignored.
 */
import path from 'node:path'

import {
  DEFAULT_OUT_DIR,
  exportOldSite
} from './export-old-site/export'
import { downloadOldImage } from './migrate-mongo/plan'

const USAGE =
  "Usage: MONGODB_URI='mongodb+srv://…/<db>' pnpm run export-old-site [--out <dir>] [--db <name>]"

function flag(args: string[], name: string) {
  const i = args.indexOf(name)
  if (i === -1) return
  const value = args[i + 1]
  if (!value || value.startsWith('--')) {
    console.error(`${name} needs a value\n${USAGE}`)
    process.exit(1)
  }
  return value
}

async function main() {
  const args = process.argv.slice(2)
  // env, not a flag, so the password stays out of shell history
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error(`❌ MONGODB_URI isn't set.\n${USAGE}`)
    return 1
  }
  const outDir = path.resolve(flag(args, '--out') ?? DEFAULT_OUT_DIR)
  const { counts, imageCount, unreachableImages } =
    await exportOldSite({
      uri,
      db: flag(args, '--db'),
      outDir,
      download: downloadOldImage
    })

  console.info(`Exported to ${outDir}:`)
  for (const [collection, count] of Object.entries(counts)) {
    console.info(`  ${collection.padEnd(13)} ${count}`)
  }
  console.info(`  images        ${imageCount} referenced`)
  if (Object.values(counts).every((count) => count === 0)) {
    console.warn(
      '⚠️  Every collection is empty. Check that the URI (or --db) names the old site’s database.'
    )
    return 1
  }
  if (unreachableImages.length) {
    console.warn(
      '⚠️  Some images could not be downloaded, so the import would skip them. Is the old bucket public?'
    )
    for (const { url, reason } of unreachableImages) {
      console.warn(`  ${url}: ${reason}`)
    }
    return 1
  }
  console.info(
    '✅ Done. Send this folder privately to whoever runs pnpm run import-old-site.'
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
