'use server'

import {
  DeleteObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

import { assertAuthed } from '@/lib/auth/guard'
import { s3 } from '@/lib/images/s3-client'
import { uploadFormats } from '@/lib/images/util'

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

/** Real format from the bytes, not the name or MIME type. */
async function sniffFormat(bytes: Buffer) {
  let format: string | undefined
  try {
    format = (await sharp(bytes).metadata()).format
  } catch {
    throw new Error('File is not a readable image')
  }

  const upload = format ? uploadFormats[format] : undefined
  if (!upload) {
    throw new Error(
      `Unsupported image format${format ? ` (${format})` : ''}; use JPEG, PNG, WebP or GIF`
    )
  }
  return upload
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

  const bytes = Buffer.from(await file.arrayBuffer())
  const { ext, contentType } = await sniffFormat(bytes)
  // Unique key per upload, so same-named files never overwrite
  const key = `images/${crypto.randomUUID()}.${ext}`

  const res = await getPresignedUploadUrl(key, contentType)
  const uploadRes = await fetch(res, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: bytes
  })

  if (!uploadRes.ok) throw new Error('Upload failed')

  return res.split('?')[0] // URL without query params
}
