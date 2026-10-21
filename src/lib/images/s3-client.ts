import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

/**
 * Server-only S3 access, deliberately not a `'use server'` module:
 * its exports would otherwise be public server actions, callable
 * without a session. Session-checked actions live in `s3.ts`.
 */
export const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

/**
 * Direct server-side upload for bytes already in hand (e.g. a fetched
 * remote thumbnail), skipping the presigned-URL round trip `uploadFile`
 * needs for client-supplied files.
 */
export async function uploadBufferToS3({
  buffer,
  key,
  contentType
}: {
  buffer: Buffer
  key: string
  contentType: string
}): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  )
  return `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`
}
