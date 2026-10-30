/**
 * Server-only, deliberately not a `'use server'` module: its exports
 * would otherwise be public server actions.
 */
import sharp, { type Metadata } from 'sharp'

import { sql } from '@/lib/db'
import { MIN_SHORT_EDGE } from '@/lib/images/util'
import { packIco } from '@/lib/site-settings/ico'
import {
  ICON_VERSION,
  SITE_ICON_FILES,
  type SiteIconRole
} from '@/lib/site-settings/util'
import { storageAdapter } from '@/lib/storage'
import { iconKey, imageKey } from '@/lib/storage/keys'

const FAVICON_SIZES = [16, 32, 48]
const PNG_SIZES: Partial<Record<SiteIconRole, number>> = {
  icon32: 32,
  icon192: 192,
  icon512: 512
}
const APPLE_TOUCH_ICON_SIZE = 180

export const tooSmallIconMessage = `The site icon is too small. Choose an image at least ${MIN_SHORT_EDGE}px on its short edge`

async function readOriginal(imageId: string): Promise<Buffer> {
  const [image] = await sql`
    SELECT id, url, format FROM images WHERE id = ${imageId}
  `
  if (!image) throw new Error('The site icon image was not found')
  // rows saved before the storage copy have no format
  const url = image.format
    ? storageAdapter().publicUrl(imageKey(image.id, image.format))
    : image.url
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(
      `Failed to download the site icon image: ${res.status}`
    )
  }
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Writes every icon (see SITE_ICON_FILES) for an image at
 * ICON_VERSION, center-cropped to a square from its first frame.
 * Throws a user-facing message for a small or unreadable image.
 */
export async function generateSiteIcons(imageId: string) {
  try {
    const bytes = await readOriginal(imageId)
    let metadata: Metadata
    try {
      metadata = await sharp(bytes).metadata()
    } catch {
      throw new Error('The site icon is not a readable image')
    }
    // an animation's height spans every frame
    const { width, height } = metadata.autoOrient
    if (
      Math.min(width, metadata.pageHeight ?? height) < MIN_SHORT_EDGE
    ) {
      throw new Error(tooSmallIconMessage)
    }

    const square = (size: number) =>
      sharp(bytes)
        .autoOrient()
        .resize(size, size, { fit: 'cover', position: 'centre' })

    const files: [SiteIconRole, Buffer][] = [
      [
        'favicon',
        packIco(
          await Promise.all(
            FAVICON_SIZES.map(async (size) => ({
              size,
              png: await square(size).png().toBuffer()
            }))
          )
        )
      ],
      ...(await Promise.all(
        Object.entries(PNG_SIZES).map(
          async ([role, size]) =>
            [
              role as SiteIconRole,
              await square(size).png().toBuffer()
            ] as [SiteIconRole, Buffer]
        )
      )),
      [
        'appleTouchIcon',
        // iOS shows transparency as black
        await square(APPLE_TOUCH_ICON_SIZE)
          .flatten({ background: '#ffffff' })
          .png()
          .toBuffer()
      ]
    ]

    const storage = storageAdapter()
    for (const [role, body] of files) {
      const file = SITE_ICON_FILES[role]
      await storage.put(
        iconKey(imageId, ICON_VERSION, file),
        body,
        file.endsWith('.ico') ? 'image/x-icon' : 'image/png',
        // a retry after a failed save rewrites the same keys
        { isOverwriteAllowed: true }
      )
    }
  } catch (err) {
    // runFormAction doesn't log save errors
    console.error(
      `Failed to generate site icons for ${imageId}:`,
      err
    )
    throw err
  }
}
