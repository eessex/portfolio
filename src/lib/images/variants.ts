/**
 * Server-only, deliberately not a `'use server'` module: its exports
 * would otherwise be public server actions.
 */
import sharp from 'sharp'

import { VARIANT_VERSION, VARIANT_WIDTHS } from '@/lib/images/util'
import { storageAdapter } from '@/lib/storage'
import { imageVariantKey } from '@/lib/storage/keys'

const BLUR_WIDTH = 16

export interface ImageVariants {
  blurDataUrl: string
  variantVersion: number
}

/**
 * Writes an original's WebP widths (see `imageVariantKey`) and
 * returns its blur placeholder. Never wider than the original, so a
 * narrow image's larger widths are copies of its full size. Animated
 * GIF/WebP stay animated. Re-runs overwrite: variants are derived.
 */
export async function generateImageVariants(
  id: string,
  bytes: Buffer
): Promise<ImageVariants> {
  const { pages = 1 } = await sharp(bytes).metadata()
  const isAnimated = pages > 1
  const storage = storageAdapter()

  // one at a time, so a large photo is decoded once per width, not
  // all at once
  for (const width of VARIANT_WIDTHS) {
    const variant = await sharp(bytes, { animated: isAnimated })
      .autoOrient()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
    await storage.put(
      imageVariantKey(id, width, VARIANT_VERSION),
      variant,
      'image/webp',
      { isOverwriteAllowed: true }
    )
  }

  const blur = await sharp(bytes)
    .autoOrient()
    .resize({ width: BLUR_WIDTH })
    .webp({ quality: 40 })
    .toBuffer()

  return {
    blurDataUrl: `data:image/webp;base64,${blur.toString('base64')}`,
    variantVersion: VARIANT_VERSION
  }
}
