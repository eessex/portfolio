import { createBlobAdapter } from '@/lib/storage/blob'
import {
  type StorageProvider,
  storageProvider
} from '@/lib/storage/keys'
import { createS3Adapter } from '@/lib/storage/s3'
import type { StorageAdapter } from '@/lib/storage/types'

/**
 * Server-only file storage, deliberately not a `'use server'` module:
 * its exports would otherwise be public server actions. Session-checked
 * actions live in `src/lib/images/upload.ts`.
 */
const adapters = new Map<StorageProvider, StorageAdapter>()

/** The active provider's adapter, or a named one (e.g. for a copy). */
export function storageAdapter(
  provider: StorageProvider = storageProvider()
): StorageAdapter {
  let adapter = adapters.get(provider)
  if (!adapter) {
    adapter =
      provider === 'blob' ? createBlobAdapter() : createS3Adapter()
    adapters.set(provider, adapter)
  }
  return adapter
}
