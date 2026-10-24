/**
 * Copies stored files from one provider to the other, so switching is
 * a copy plus an env change (see "Switching storage providers" in the
 * image optimization plan).
 *
 *   pnpm run copy-storage --to blob --dry-run
 *   pnpm run copy-storage --to blob
 *
 * Then set STORAGE_PROVIDER to the target and redeploy. Needs
 * DATABASE_URL and both providers' credentials in .env. Safe to stop
 * and re-run: it skips files the target already has, and never deletes
 * or overwrites anything.
 *
 * The copy is a snapshot of the rows at the time it runs, so allow no
 * writes (image uploads, embed code saves) from the start of the copy
 * until the redeploy is live. A file uploaded in between exists only
 * on the source, and after the switch its target URL returns 404. If
 * anything was written in that window, re-run the copy before
 * switching.
 *
 *   pnpm run copy-storage --rename-only [--dry-run]
 *
 * Runs only the renames (step 1), writing to the active provider alone.
 * Use it to move images out of an old bucket
 * into the current one before any provider switch; afterwards every row
 * has a format. It updates only Postgres, so cached image and page
 * reads still hold the old-bucket URLs: redeploy (or invalidate the
 * images, projects, releases and events tags) before retiring the old
 * bucket.
 *
 * 1. Renames. Rows saved before Stage 3 have no format, and their file
 *    is named after the upload (images/IMG_0001.jpg) or a random key.
 *    Each is read from its stored url and written as images/{id}.{ext}
 *    to BOTH providers, then its format, size and original filename are
 *    recorded. Writing both first means a row with a format resolves on
 *    either provider, so the switch and a rollback both keep working.
 * 2. Copies. Every row's images/{id}.{ext} and every embed code's
 *    cover files that the target is missing are copied from the source.
 *
 * Old names stay on the source until it's retired by hand.
 */
import { neon } from '@neondatabase/serverless'
import sharp from 'sharp'

import {
  COVER_IMAGE_EXTENSION,
  COVER_IMAGE_PATH_PREFIX,
  COVER_IMAGE_THUMBNAIL_SIZE
} from '@/lib/embed-codes/cover-image-url'
import { uploadFormats } from '@/lib/images/util'
import { storageAdapter } from '@/lib/storage'
import {
  IMAGE_PATH_PREFIX,
  imageKey,
  keyFromUrl,
  type StorageProvider,
  storageProvider,
  storageProviders
} from '@/lib/storage/keys'
import type { StorageAdapter } from '@/lib/storage/types'

function parseArgs() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  if (args.includes('--rename-only')) {
    return { to: undefined, isDryRun }
  }
  const to = args[args.indexOf('--to') + 1]
  if (
    !args.includes('--to') ||
    !storageProviders.includes(to as never)
  ) {
    console.error(
      'Usage: pnpm run copy-storage --to blob|s3 [--dry-run]\n' +
        '       pnpm run copy-storage --rename-only [--dry-run]'
    )
    process.exit(1)
  }
  return { to: to as StorageProvider, isDryRun }
}

async function listKeys(storage: StorageAdapter, prefix: string) {
  const keys = new Set<string>()
  for await (const key of storage.list(prefix)) keys.add(key)
  return keys
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return Buffer.from(await res.arrayBuffer())
}

function contentTypeOf(key: string) {
  const ext = key.split('.').pop()
  const upload = Object.values(uploadFormats).find(
    (format) => format.ext === ext
  )
  return upload?.contentType ?? 'application/octet-stream'
}

async function main() {
  const { to, isDryRun } = parseArgs()
  const isRenameOnly = !to
  const from: StorageProvider = isRenameOnly
    ? storageProvider()
    : to === 'blob'
      ? 's3'
      : 'blob'
  if (!process.env.DATABASE_URL)
    throw new Error('Missing DATABASE_URL')
  const sql = neon(process.env.DATABASE_URL)
  const source = storageAdapter(from)
  const target = isRenameOnly ? source : storageAdapter(to)
  const dryRunNote = isDryRun ? ' (dry run, nothing is written)' : ''

  console.info(
    isRenameOnly
      ? `Renaming older images into ${from}${dryRunNote}`
      : `Copying ${from} → ${to}${dryRunNote}`
  )
  const prefixes = [
    `${IMAGE_PATH_PREFIX}/`,
    `${COVER_IMAGE_PATH_PREFIX}/`
  ]
  const existing = new Map<StorageAdapter, Set<string>>()
  for (const storage of new Set([source, target])) {
    const keys = new Set<string>()
    for (const prefix of prefixes) {
      for (const key of await listKeys(storage, prefix)) keys.add(key)
    }
    existing.set(storage, keys)
  }

  async function putMissing(
    storage: StorageAdapter,
    key: string,
    bytes: Buffer
  ) {
    const keys = existing.get(storage)!
    if (keys.has(key)) return false
    if (!isDryRun) await storage.put(key, bytes, contentTypeOf(key))
    keys.add(key)
    return true
  }

  const failures: string[] = []

  // 1. Renames
  const unnamed = (await sql`
    SELECT id, url FROM images WHERE format IS NULL ORDER BY created_at
  `) as { id: string; url: string }[]
  console.info(`Renaming ${unnamed.length} older images`)
  for (const { id, url } of unnamed) {
    try {
      const bytes = await download(url)
      const metadata = await sharp(bytes).metadata()
      const format = metadata.format
      if (!format || !uploadFormats[format]) {
        throw new Error(`unsupported format ${format}`)
      }
      const key = imageKey(id, format)
      for (const storage of new Set([source, target])) {
        await putMissing(storage, key, bytes)
      }
      const originalFilename = keyFromUrl(url).split('/').pop()
      if (!isDryRun) {
        await sql`
          UPDATE images
          SET
            format = ${format},
            width = ${metadata.width},
            height = ${metadata.pageHeight ?? metadata.height},
            original_filename = COALESCE(original_filename, ${originalFilename ?? null})
          WHERE id = ${id} AND format IS NULL
        `
      }
      console.info(`  ${url} → ${key}`)
    } catch (err) {
      failures.push(`${id} (${url}): ${(err as Error).message}`)
    }
  }

  if (isRenameOnly) {
    reportFailures(failures)
    if (failures.length === 0 && !isDryRun) {
      console.info(
        `Done. Every image is now on ${from} as images/{id}.{ext}; nothing was removed from its old location.\n` +
          'Cached pages still use the old URLs: redeploy (or invalidate the image and page caches) before retiring the old bucket.'
      )
    }
    return
  }

  // 2. Copies; a snapshot, so rows written after this are missed
  const named = (await sql`
    SELECT id, format FROM images WHERE format IS NOT NULL
  `) as { id: string; format: string }[]
  const covers = (await sql`
    SELECT cover_image_id FROM embed_codes WHERE cover_image_id IS NOT NULL
  `) as { cover_image_id: string }[]
  const keys = [
    ...named.map(({ id, format }) => imageKey(id, format)),
    ...covers.flatMap(({ cover_image_id: id }) => [
      `${COVER_IMAGE_PATH_PREFIX}/${id}.${COVER_IMAGE_EXTENSION}`,
      `${COVER_IMAGE_PATH_PREFIX}/${id}_${COVER_IMAGE_THUMBNAIL_SIZE}.${COVER_IMAGE_EXTENSION}`
    ])
  ]
  let copied = 0
  for (const key of keys) {
    if (existing.get(target)!.has(key)) continue
    if (!existing.get(source)!.has(key)) {
      // renamed in a dry run, or missing on the source too
      if (!isDryRun) failures.push(`${key}: not on ${from}`)
      continue
    }
    try {
      const bytes = await download(source.publicUrl(key))
      if (await putMissing(target, key, bytes)) copied++
    } catch (err) {
      failures.push(`${key}: ${(err as Error).message}`)
    }
  }
  console.info(
    `Copied ${copied} of ${keys.length} files; the rest were already on ${to}`
  )

  reportFailures(failures)
  if (failures.length === 0 && !isDryRun) {
    console.info(
      `Done. Set STORAGE_PROVIDER=${to} and redeploy; nothing on ${from} was removed.\n` +
        'Allow no uploads until the redeploy is live; if any happened since this copy started, re-run it before switching.'
    )
  }
}

function reportFailures(failures: string[]) {
  if (failures.length === 0) return
  console.error(`${failures.length} failed:`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
