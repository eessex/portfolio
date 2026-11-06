'use server'

import { createHash } from 'node:crypto'

import sharp, { type Metadata } from 'sharp'

import { assertAuthed } from '@/lib/auth/guard'
import { sanitizeSvg } from '@/lib/images/sanitize-svg'
import type { ImageFormat } from '@/lib/images/schemas/db'
import {
  acceptedFormatsText,
  animationTooLargeMessage,
  badAspectMessage,
  MAX_ANIMATION_PIXELS,
  MAX_ASPECT,
  MAX_INPUT_PIXELS,
  MIN_ASPECT,
  MIN_SHORT_EDGE,
  tooManyPixelsMessage,
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
 * Throws a user-facing message for anything the spec refuses. An SVG
 * is sanitized first; the returned bytes are what gets stored.
 */
async function readImage(
  bytes: Buffer,
  name: string,
  isSvgAllowed: boolean
) {
  let metadata = await readMetadata(bytes)
  if (metadata.format === 'svg') {
    if (!isSvgAllowed) {
      throw new Error(unsupportedFormatMessage('svg', isSvgAllowed))
    }
    bytes = await sanitizeSvg(bytes)
    metadata = await readMetadata(bytes)
    return { ...readSvg(metadata, name), bytes }
  }

  const { format, pageHeight, pages = 1 } = metadata
  // the size as displayed, after EXIF rotation
  const { width, height } = metadata.autoOrient
  const upload = format ? uploadFormats[format] : undefined
  if (!upload) {
    throw new Error(unsupportedFormatMessage(format, isSvgAllowed))
  }
  // one frame's height; sharp gives the whole strip only when opened `animated`
  const frameHeight = pageHeight ?? height
  if (Math.min(width, frameHeight) < MIN_SHORT_EDGE) {
    throw new Error(tooSmallMessage(name))
  }
  if (width * frameHeight > MAX_INPUT_PIXELS) {
    throw new Error(tooManyPixelsMessage(name))
  }
  const aspect = width / frameHeight
  if (aspect < MIN_ASPECT || aspect > MAX_ASPECT) {
    throw new Error(badAspectMessage(name))
  }
  if (width * frameHeight * pages > MAX_ANIMATION_PIXELS) {
    throw new Error(animationTooLargeMessage(name))
  }
  return {
    ...upload,
    format: format as ImageFormat,
    width,
    height: frameHeight,
    bytes
  }
}

function unsupportedFormatMessage(
  format: string | undefined,
  isSvgAllowed: boolean
) {
  return `Unsupported image format${format ? ` (${format})` : ''}; use ${acceptedFormatsText(isSvgAllowed)}`
}

async function readMetadata(bytes: Buffer) {
  try {
    return await sharp(bytes).metadata()
  } catch {
    throw new Error('File is not a readable image')
  }
}

// vectors scale, so only the shape is checked, not pixel counts
function readSvg({ width, height }: Metadata, name: string) {
  if (!width || !height) {
    throw new Error(
      `"${name}" has no size; give its <svg> a viewBox or width and height`
    )
  }
  const aspect = width / height
  if (aspect < MIN_ASPECT || aspect > MAX_ASPECT) {
    throw new Error(badAspectMessage(name))
  }
  return {
    ...uploadFormats.svg!,
    format: 'svg' as const,
    width,
    height
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

export interface UploadOptions {
  /** Only the site icon and logo pickers take an SVG */
  isSvgAllowed?: boolean
}

/**
 * Issues the image's id and writes the original to
 * `images/{id}.{ext}`, so every file derives from the id. The row is
 * inserted with this id afterwards (see `createImage`).
 */
export async function uploadFile(
  file: File,
  { isSvgAllowed = false }: UploadOptions = {}
): Promise<UploadedImage> {
  await assertAuthed()

  const startedAt = performance.now()
  let image: Awaited<ReturnType<typeof readImage>>
  try {
    image = await readImage(
      Buffer.from(await file.arrayBuffer()),
      file.name,
      isSvgAllowed
    )
  } catch (err) {
    console.warn('Refused image upload:', {
      size: file.size,
      reason: (err as Error).message
    })
    throw err
  }
  const { bytes } = image
  const id = crypto.randomUUID()
  const key = imageKey(id, image.format)
  const readAt = performance.now()

  const storage = storageAdapter()
  await storage.put(key, bytes, image.contentType)
  const putAt = performance.now()

  // without variants the image is served through the optimizer until
  // the backfill writes them, so a failure here doesn't fail the save
  let variants: ImageVariants | undefined
  if (image.format !== 'svg') {
    try {
      variants = await generateImageVariants(id, bytes)
    } catch (err) {
      console.error('Error writing image variants:', key, err)
    }
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
