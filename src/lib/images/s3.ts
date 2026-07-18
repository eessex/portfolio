'use server'

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { assertAuthed } from '@/lib/auth/guard'

export async function getKeyFromS3Url(url: string): Promise<string> {
  try {
    const parsed = new URL(url)
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))
  } catch {
    throw new Error(`Invalid S3 URL: ${url}`)
  }
}

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function deleteFromS3(url: string) {
  await assertAuthed()

  const key = await getKeyFromS3Url(url)
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

async function getPresignedUploadUrl(
  filename: string,
  contentType: string
) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!
  const key = `images/${filename}`

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

  const res = await getPresignedUploadUrl(file.name, file.type)
  const uploadRes = await fetch(res, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  })

  if (!uploadRes.ok) throw new Error('Upload failed')

  return res.split('?')[0] // URL without query params
}
