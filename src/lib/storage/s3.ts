import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'

import { publicUrl, STORAGE_CACHE_MAX_AGE } from '@/lib/storage/keys'
import type { StorageAdapter } from '@/lib/storage/types'

/**
 * Server-only, deliberately not a `'use server'` module: its exports
 * would otherwise be public server actions, callable without a session.
 */
export function createS3Adapter(): StorageAdapter {
  const bucket = process.env.AWS_S3_BUCKET_NAME
  const region = process.env.AWS_S3_REGION
  if (!bucket || !region) {
    throw new Error(
      'S3 storage needs AWS_S3_BUCKET_NAME and AWS_S3_REGION'
    )
  }
  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

  return {
    provider: 's3',

    async put(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: `public, max-age=${STORAGE_CACHE_MAX_AGE}, immutable`
        })
      )
    },

    async delete(key) {
      await client.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: key })
      )
    },

    async *list(prefix) {
      let token: string | undefined
      do {
        const res = await client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: token
          })
        )
        for (const { Key } of res.Contents ?? []) {
          if (Key) yield Key
        }
        token = res.IsTruncated
          ? res.NextContinuationToken
          : undefined
      } while (token)
    },

    publicUrl: (key) => publicUrl(key, 's3')
  }
}
