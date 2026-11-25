/**
 * Storage keys and public URLs, derived from env alone. No SDK imports,
 * so image schemas (also bundled for the client) and next.config.ts can
 * use it. Relative imports only: next.config.ts loads this file without
 * the `@/` alias.
 */
import { uploadFormats, variantSuffix } from '../images/util'

/** Every original lives at `images/{id}.{ext}`. */
export const IMAGE_PATH_PREFIX = 'images'

/** Generated site icons: `icons/{imageId}/v{version}/{file}`. */
export const ICON_PATH_PREFIX = 'icons'

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

/**
 * The URL a key is served from. The only place that knows a storage
 * hostname, so changing the store needs no data change.
 */
export function publicUrl(key: string): string {
  const hostname = blobHostname()
  if (!hostname) {
    throw new Error(
      'No Blob store host; set BLOB_READ_WRITE_TOKEN (or BLOB_STORE_ID)'
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

/** One of an original's WebP widths; see `imageVariantUrl`. */
export function imageVariantKey(
  id: string,
  width: number,
  version: number
): string {
  return `${IMAGE_PATH_PREFIX}/${id}${variantSuffix(width, version)}`
}

/**
 * One of a site icon's generated files. An image's file never changes,
 * so a new icon (or ICON_VERSION) always gets new URLs.
 */
export function iconKey(
  imageId: string,
  version: number,
  file: string
): string {
  return `${ICON_PATH_PREFIX}/${imageId}/v${version}/${file}`
}

/** A stored URL's key: its path, decoded, without the leading slash. */
export function keyFromUrl(url: string): string {
  return decodeURIComponent(new URL(url).pathname.replace(/^\/+/, ''))
}

/** One year: files never change after upload, see imageKey. */
export const STORAGE_CACHE_MAX_AGE = 60 * 60 * 24 * 365
