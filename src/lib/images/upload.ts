'use server'

import { createHash } from 'node:crypto'

import sharp, { type Metadata } from 'sharp'

import { assertAuthed } from '@/lib/auth/guard'
import type { ImageFormat } from '@/lib/images/schemas/db'
import {
  MIN_SHORT_EDGE,
  tooSmallMessage,
  uploadFormats
} from '@/lib/images/util'
import { storageAdapter } from '@/lib/storage'
import {
  imageKey,
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

  const { format, width, height, pageHeight } = metadata
  const upload = format ? uploadFormats[format] : undefined
  if (!upload) {
    throw new Error(
      `Unsupported image format${format ? ` (${format})` : ''}; use JPEG, PNG, WebP or GIF`
    )
  }
  // an animated GIF/WebP's height spans every frame
  const shortEdge = Math.min(width, pageHeight ?? height)
  if (shortEdge < MIN_SHORT_EDGE) {
    throw new Error(tooSmallMessage(name))
  }
  return {
    ...upload,
    format: format as ImageFormat,
    width,
    height: pageHeight ?? height
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

  console.info('Uploaded image:', {
    key,
    provider: storage.provider,
    size: file.size,
    width: image.width,
    height: image.height,
    readMs: Math.round(readAt - startedAt),
    putMs: Math.round(performance.now() - readAt)
  })
  return {
    id,
    format: image.format,
    width: image.width,
    height: image.height,
    originalFilename: file.name,
    contentHash: createHash('sha256').update(bytes).digest('hex'),
    url: storage.publicUrl(key)
  }
}

/**
 * Removes an image's original. Rows saved before the Stage 3 copy have
 * no format; their file is found from the stored url, and only when it
 * lives on the active provider. Storage errors are logged, not thrown.
 */
export async function deleteImageFile(image: {
  id: string
  url: string
  format?: string | null
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
  } catch (err) {
    console.error('Error deleting image file:', err)
  }
}
