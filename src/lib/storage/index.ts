import { createBlobAdapter } from '@/lib/storage/blob'
import type { StorageAdapter } from '@/lib/storage/types'

/**
 * Server-only file storage, deliberately not a `'use server'` module:
 * its exports would otherwise be public server actions. Session-checked
 * actions live in `src/lib/images/upload.ts`.
 */
let adapter: StorageAdapter | undefined

export function storageAdapter(): StorageAdapter {
  adapter ??= createBlobAdapter()
  return adapter
}
