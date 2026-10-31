/**
 * Writes the WebP widths and blur placeholder for every image whose
 * variants are missing or older than VARIANT_VERSION, so it's served
 * without the optimizer (see Stage 4 in the image optimization plan).
 *
 *   pnpm run backfill-image-variants --dry-run
 *   pnpm run backfill-image-variants
 *   pnpm run backfill-image-variants --prune [--dry-run]
 *
 * Needs DATABASE_URL and the active provider's credentials in .env.
 * Reads each original from active storage and records its displayed
 * size (after EXIF rotation), content hash and variant version. Safe
 * to stop and re-run: it skips images already at the current version,
 * and rewrites a partly written image's variants.
 *
 * It also regenerates the site icon when its icon_version is older
 * than ICON_VERSION.
 *
 * It updates only Postgres, so cached reads keep serving through the
 * optimizer, or an older version's variants: redeploy afterwards.
 *
 * --prune deletes variants older than their row's version. Run it only
 * once the redeploy is live, since cached pages still request the old
 * files until then.
 */
import { createHash } from 'node:crypto'

import {
  neon,
  type NeonQueryFunction
} from '@neondatabase/serverless'
import sharp from 'sharp'

import { VARIANT_VERSION } from '@/lib/images/util'
import { generateImageVariants } from '@/lib/images/variants'
import { generateSiteIcons } from '@/lib/site-settings/icons'
import { ICON_VERSION } from '@/lib/site-settings/util'
import { storageAdapter } from '@/lib/storage'
import { IMAGE_PATH_PREFIX, imageKey } from '@/lib/storage/keys'
import type { StorageAdapter } from '@/lib/storage/types'

// imageVariantKey's name: images/{id}_v{n}_{w}.webp
const VARIANT_KEY = new RegExp(
  `^${IMAGE_PATH_PREFIX}/([0-9a-f-]{36})_v(\\d+)_\\d+\\.webp$`
)

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  if (!process.env.DATABASE_URL)
    throw new Error('Missing DATABASE_URL')
  const sql = neon(process.env.DATABASE_URL)
  const storage = storageAdapter()
  if (args.includes('--prune')) {
    return prune(sql, storage, isDryRun)
  }

  const rows = (await sql`
    SELECT id, format FROM images
    WHERE format IS NOT NULL
      AND COALESCE(variant_version, 0) < ${VARIANT_VERSION}
    ORDER BY created_at
  `) as { id: string; format: string }[]
  const skipped = (await sql`
    SELECT count(*)::int AS n FROM images WHERE format IS NULL
  `) as { n: number }[]

  const dryRunNote = isDryRun ? ' (dry run, nothing is written)' : ''
  console.info(
    `Backfilling ${rows.length} images on ${storage.provider}${dryRunNote}`
  )
  if (skipped[0]?.n) {
    console.warn(
      `${skipped[0].n} images have no format; run copy-storage --rename-only first`
    )
  }

  const failures: string[] = []
  let done = 0
  for (const { id, format } of rows) {
    const key = imageKey(id, format)
    try {
      const bytes = await download(storage.publicUrl(key))
      // as displayed, after EXIF rotation; an animation's height
      // spans every frame
      const { autoOrient, pageHeight } = await sharp(bytes).metadata()
      const { width } = autoOrient
      const height = pageHeight ?? autoOrient.height
      if (isDryRun) {
        console.info(`  ${key}: ${width}×${height}`)
        continue
      }
      const variants = await generateImageVariants(id, bytes)
      await sql`
        UPDATE images
        SET
          width = ${width},
          height = ${height},
          aspect = ${width / height},
          content_hash = ${createHash('sha256').update(bytes).digest('hex')},
          blur_data_url = ${variants.blurDataUrl},
          variant_version = ${variants.variantVersion}
        WHERE id = ${id}
      `
      done++
      console.info(`  ${key} (${done} of ${rows.length})`)
    } catch (err) {
      failures.push(`${key}: ${(err as Error).message}`)
    }
  }

  const staleIcons = (await sql`
    SELECT id, icon_image_id FROM site_settings
    WHERE icon_image_id IS NOT NULL
      AND COALESCE(icon_version, 0) < ${ICON_VERSION}
  `) as { id: string; icon_image_id: string }[]
  for (const { id, icon_image_id: imageId } of staleIcons) {
    try {
      if (!isDryRun) {
        await generateSiteIcons(imageId)
        await sql`
          UPDATE site_settings
          SET icon_version = ${ICON_VERSION}
          WHERE id = ${id} AND icon_image_id = ${imageId}
        `
      }
      console.info(`  site icon ${imageId} → v${ICON_VERSION}`)
    } catch (err) {
      failures.push(`site icon ${imageId}: ${(err as Error).message}`)
    }
  }

  reportFailures(failures)
  if (failures.length === 0 && !isDryRun) {
    console.info(
      'Done. Redeploy so cached reads pick up the variants, then run --prune.'
    )
  }
}

/** Deletes each row's variants from versions before its own. */
async function prune(
  sql: NeonQueryFunction<false, false>,
  storage: StorageAdapter,
  isDryRun: boolean
) {
  const rows = (await sql`
    SELECT id, variant_version FROM images
    WHERE variant_version IS NOT NULL
  `) as { id: string; variant_version: number }[]
  const versions = new Map(
    rows.map((row) => [row.id, row.variant_version])
  )

  const stale: string[] = []
  for await (const key of storage.list(`${IMAGE_PATH_PREFIX}/`)) {
    const [, id, version] = key.match(VARIANT_KEY) ?? []
    const current = id && versions.get(id)
    if (current && Number(version) < current) stale.push(key)
  }

  const dryRunNote = isDryRun ? ' (dry run, nothing is deleted)' : ''
  console.info(
    `Pruning ${stale.length} old variants on ${storage.provider}${dryRunNote}`
  )
  const failures: string[] = []
  for (const key of stale) {
    try {
      if (!isDryRun) await storage.delete(key)
      console.info(`  ${key}`)
    } catch (err) {
      failures.push(`${key}: ${(err as Error).message}`)
    }
  }
  reportFailures(failures)
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
