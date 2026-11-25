/**
 * The file store (Vercel Blob). Files are named by key, e.g.
 * `images/{id}.jpg`.
 */
export interface StorageAdapter {
  provider: 'blob'
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
  /** Every key under a prefix. */
  list(prefix: string): AsyncIterable<string>
  publicUrl(key: string): string
}
