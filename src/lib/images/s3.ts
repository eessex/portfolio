'use server'

import {
  DeleteObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp, { type Metadata } from 'sharp'

import { assertAuthed } from '@/lib/auth/guard'
import { s3 } from '@/lib/images/s3-client'
import {
  MIN_SHORT_EDGE,
  tooSmallMessage,
  uploadFormats
} from '@/lib/images/util'

function getKeyFromS3Url(url: string): string {
  try {
    const parsed = new URL(url)
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))
  } catch {
    throw new Error(`Invalid S3 URL: ${url}`)
  }
}

export async function deleteFromS3(url: string) {
  await assertAuthed()

  const key = getKeyFromS3Url(url)
  try {
    const res = await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key
      })
    )
    console.info('Deleted old image from S3:', url, res)
  } catch (err) {
    console.error('Error deleting image from S3:', err)
  }
}

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
  return { ...upload, width, height: pageHeight ?? height }
}

async function getPresignedUploadUrl(
  key: string,
  contentType: string
) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!

  console.info('Generating presigned URL for:', key, bucketName)
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType
  })

  return await getSignedUrl(s3, command, { expiresIn: 60 * 5 }) // 5 minutes
}

export async function uploadFile(file: File) {
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
  const { ext, contentType } = image
  // Unique key per upload, so same-named files never overwrite
  const key = `images/${crypto.randomUUID()}.${ext}`
  const readAt = performance.now()

  const res = await getPresignedUploadUrl(key, contentType)
  const uploadRes = await fetch(res, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: bytes
  })

  if (!uploadRes.ok) throw new Error('Upload failed')

  console.info('Uploaded image:', {
    key,
    size: file.size,
    width: image.width,
    height: image.height,
    readMs: Math.round(readAt - startedAt),
    putMs: Math.round(performance.now() - readAt)
  })
  return res.split('?')[0] // URL without query params
}
