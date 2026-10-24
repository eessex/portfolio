import { del, list, put } from '@vercel/blob'

import { publicUrl, STORAGE_CACHE_MAX_AGE } from '@/lib/storage/keys'
import type { StorageAdapter } from '@/lib/storage/types'

/**
 * Vercel Blob, read-write through BLOB_READ_WRITE_TOKEN. Server-only,
 * deliberately not a `'use server'` module, like the S3 adapter.
 */
export function createBlobAdapter(): StorageAdapter {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Blob storage needs BLOB_READ_WRITE_TOKEN')
  }

  return {
    provider: 'blob',

    async put(key, body, contentType) {
      const blob = await put(key, body, {
        access: 'public',
        contentType,
        // URLs are derived from the key, so it must be stored as given
        addRandomSuffix: false,
        // a key names one file forever
        allowOverwrite: false,
        cacheControlMaxAge: STORAGE_CACHE_MAX_AGE
      })
      const expected = publicUrl(key, 'blob')
      if (blob.url !== expected) {
        console.warn('Blob URL differs from the derived one:', {
          stored: blob.url,
          derived: expected
        })
      }
    },

    async delete(key) {
      await del(key)
    },

    async *list(prefix) {
      let cursor: string | undefined
      do {
        const res = await list({ prefix, cursor })
        for (const { pathname } of res.blobs) yield pathname
        cursor = res.hasMore ? res.cursor : undefined
      } while (cursor)
    },

    publicUrl: (key) => publicUrl(key, 'blob')
  }
}
