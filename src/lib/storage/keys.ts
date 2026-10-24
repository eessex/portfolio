/**
 * Storage keys and public URLs, derived from env alone. No SDK imports,
 * so image schemas (also bundled for the client) and next.config.ts can
 * use it. Relative imports only: next.config.ts loads this file without
 * the `@/` alias.
 */
import { uploadFormats } from '../images/util'

/** Every original lives at `images/{id}.{ext}`. */
export const IMAGE_PATH_PREFIX = 'images'

export const storageProviders = ['s3', 'blob'] as const
export type StorageProvider = (typeof storageProviders)[number]

function isStorageProvider(value: string): value is StorageProvider {
  return (storageProviders as readonly string[]).includes(value)
}

/**
 * STORAGE_PROVIDER when set, else whichever credentials exist: a Blob
 * token means Blob, so a fresh Vercel deploy with a Blob store just
 * works. Only one provider is ever active.
 */
export function storageProvider(): StorageProvider {
  const configured = process.env.STORAGE_PROVIDER?.trim()
  if (configured) {
    if (!isStorageProvider(configured)) {
      throw new Error(
        `Unknown STORAGE_PROVIDER "${configured}"; use s3 or blob`
      )
    }
    return configured
  }
  return process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 's3'
}

/** The bucket's host, or REMOTE_IMAGE_HOSTNAME for a non-standard endpoint. */
export function s3Hostname(): string | undefined {
  const { AWS_S3_BUCKET_NAME, AWS_S3_REGION, REMOTE_IMAGE_HOSTNAME } =
    process.env
  if (REMOTE_IMAGE_HOSTNAME) return REMOTE_IMAGE_HOSTNAME
  if (AWS_S3_BUCKET_NAME && AWS_S3_REGION) {
    return `${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com`
  }
}

/**
 * The public Blob store's host. The store id is BLOB_STORE_ID, or the
 * fourth segment of the read-write token
 * (`vercel_blob_rw_{storeId}_{secret}`), as the Blob SDK reads it.
 */
export function blobHostname(): string | undefined {
  const storeId =
    process.env.BLOB_STORE_ID?.replace(/^store_/, '') ||
    process.env.BLOB_READ_WRITE_TOKEN?.split('_')[3]
  if (storeId) {
    return `${storeId.toLowerCase()}.public.blob.vercel-storage.com`
  }
}

export function storageHostname(
  provider: StorageProvider = storageProvider()
): string | undefined {
  return provider === 'blob' ? blobHostname() : s3Hostname()
}

/**
 * The URL a key is served from. The only place that knows a storage
 * hostname, so changing provider or bucket needs no data change.
 */
export function publicUrl(
  key: string,
  provider: StorageProvider = storageProvider()
): string {
  const hostname = storageHostname(provider)
  if (!hostname) {
    throw new Error(
      `No public hostname for ${provider} storage; check its env vars`
    )
  }
  return `https://${hostname}/${key}`
}

/** An image's original, named from its id and its format as sharp reads it. */
export function imageKey(id: string, format: string): string {
  const upload = uploadFormats[format]
  if (!upload) throw new Error(`Unknown image format "${format}"`)
  return `${IMAGE_PATH_PREFIX}/${id}.${upload.ext}`
}

/** A stored URL's key: its path, decoded, without the leading slash. */
export function keyFromUrl(url: string): string {
  return decodeURIComponent(new URL(url).pathname.replace(/^\/+/, ''))
}

/** One year: files never change after upload, see imageKey. */
export const STORAGE_CACHE_MAX_AGE = 60 * 60 * 24 * 365
