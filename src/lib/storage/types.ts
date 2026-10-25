import type { StorageProvider } from '@/lib/storage/keys'

/**
 * One storage provider. Every adapter writes the same keys, so
 * `images/{id}.jpg` is the same name on S3 and on Blob, and switching
 * provider is a file copy plus an env change.
 */
export interface StorageAdapter {
  provider: StorageProvider
  /**
   * Writes a new file. Never replaces one, since keys are unique per
   * file, unless `isOverwriteAllowed`: a variant can be regenerated.
   */
  put(
    key: string,
    body: Buffer,
    contentType: string,
    options?: { isOverwriteAllowed?: boolean }
  ): Promise<void>
  delete(key: string): Promise<void>
  /** Every key under a prefix, for copying between providers. */
  list(prefix: string): AsyncIterable<string>
  publicUrl(key: string): string
}
