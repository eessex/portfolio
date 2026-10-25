'use server'

import { createHash } from 'node:crypto'

import sharp, { type Metadata } from 'sharp'

import { assertAuthed } from '@/lib/auth/guard'
import type { ImageFormat } from '@/lib/images/schemas/db'
import {
  badAspectMessage,
  MAX_ASPECT,
  MIN_ASPECT,
  MIN_SHORT_EDGE,
  tooSmallMessage,
  uploadFormats,
  VARIANT_VERSION,
  VARIANT_WIDTHS
} from '@/lib/images/util'
import {
  generateImageVariants,
  type ImageVariants
} from '@/lib/images/variants'
import { storageAdapter } from '@/lib/storage'
import {
  imageKey,
  imageVariantKey,
  keyFromUrl,
  storageHostname
} from '@/lib/storage/keys'

/**
 * Real format and size from the bytes, not the name or MIME type.
 * Throws a user-facing message for anything the spec refuses.
 */
async function readImage(bytes: Buffer, name: string) {
  let metadata: Metadata
  try {
    metadata = await sharp(bytes).metadata()
  } catch {
    throw new Error('File is not a readable image')
  }

  const { format, pageHeight } = metadata
  // the size as displayed, after EXIF rotation
  const { width, height } = metadata.autoOrient
  const upload = format ? uploadFormats[format] : undefined
  if (!upload) {
    throw new Error(
      `Unsupported image format${format ? ` (${format})` : ''}; use JPEG, PNG, WebP or GIF`
    )
  }
  // an animated GIF/WebP's height spans every frame
  const frameHeight = pageHeight ?? height
  if (Math.min(width, frameHeight) < MIN_SHORT_EDGE) {
    throw new Error(tooSmallMessage(name))
  }
  const aspect = width / frameHeight
  if (aspect < MIN_ASPECT || aspect > MAX_ASPECT) {
    throw new Error(badAspectMessage(name))
  }
  return {
    ...upload,
    format: format as ImageFormat,
    width,
    height: frameHeight
  }
}

export interface UploadedImage {
  id: string
  format: ImageFormat
  width: number
  height: number
  originalFilename: string
  contentHash: string
  url: string
  blurDataUrl?: string
  variantVersion?: number
}

/**
 * Issues the image's id and writes the original to
 * `images/{id}.{ext}`, so every file derives from the id. The row is
 * inserted with this id afterwards (see `createImage`).
 */
export async function uploadFile(file: File): Promise<UploadedImage> {
  await assertAuthed()

  const startedAt = performance.now()
  const bytes = Buffer.from(await file.arrayBuffer())
  let image: Awaited<ReturnType<typeof readImage>>
  try {
    image = await readImage(bytes, file.name)
  } catch (err) {
    console.warn('Refused image upload:', {
      size: file.size,
      reason: (err as Error).message
    })
    throw err
  }
  const id = crypto.randomUUID()
  const key = imageKey(id, image.format)
  const readAt = performance.now()

  const storage = storageAdapter()
  await storage.put(key, bytes, image.contentType)
  const putAt = performance.now()

  // without variants the image is served through the optimizer until
  // the backfill writes them, so a failure here doesn't fail the save
  let variants: ImageVariants | undefined
  try {
    variants = await generateImageVariants(id, bytes)
  } catch (err) {
    console.error('Error writing image variants:', key, err)
  }

  console.info('Uploaded image:', {
    key,
    provider: storage.provider,
    size: file.size,
    width: image.width,
    height: image.height,
    readMs: Math.round(readAt - startedAt),
    putMs: Math.round(putAt - readAt),
    variantsMs: Math.round(performance.now() - putAt)
  })
  return {
    id,
    format: image.format,
    width: image.width,
    height: image.height,
    originalFilename: file.name,
    contentHash: createHash('sha256').update(bytes).digest('hex'),
    url: storage.publicUrl(key),
    ...variants
  }
}

/**
 * Removes an image's original and its variants. Rows saved before the
 * Stage 3 copy have no format; their file is found from the stored
 * url, and only when it lives on the active provider. Storage errors
 * are logged, not thrown.
 */
export async function deleteImageFile(image: {
  id: string
  url: string
  format?: string | null
  variantVersion?: number | null
}) {
  await assertAuthed()

  try {
    const storage = storageAdapter()
    let key: string
    if (image.format) {
      key = imageKey(image.id, image.format)
    } else {
      if (new URL(image.url).hostname !== storageHostname()) {
        console.warn(
          'Image file is not on active storage:',
          image.url
        )
        return
      }
      key = keyFromUrl(image.url)
    }
    await storage.delete(key)
    console.info('Deleted image file:', key)
    if (image.format) {
      // no version: a failed upload may have written the current one
      const version = image.variantVersion || VARIANT_VERSION
      await Promise.all(
        VARIANT_WIDTHS.map((width) =>
          storage.delete(imageVariantKey(image.id, width, version))
        )
      )
    }
  } catch (err) {
    console.error('Error deleting image file:', err)
  }
}
