import { publicUrl } from '@/lib/storage/keys'

export const COVER_IMAGE_PATH_PREFIX = 'embedCodeCoverImages'
export const COVER_IMAGE_EXTENSION = 'jpg'

/**
 * Bounding box (width and height, since resizing preserves aspect within
 * it) for the resized thumbnail variant, also used as its filename suffix
 * — see `coverImageUrlFromId`. Big enough for the 32px-tall picker rows
 * at 2x on every host's aspect ratio. Served as stored, not through the
 * optimizer — see `isCoverImageThumbnailUrl`.
 */
export const COVER_IMAGE_THUMBNAIL_SIZE = 96

/** An embed cover's stored thumbnail, already small enough to serve as-is. */
export function isCoverImageThumbnailUrl(url: string) {
  const path = url.split('?')[0] ?? ''
  return (
    path.includes(`/${COVER_IMAGE_PATH_PREFIX}/`) &&
    path.endsWith(
      `_${COVER_IMAGE_THUMBNAIL_SIZE}.${COVER_IMAGE_EXTENSION}`
    )
  )
}

export interface WithCoverImageUrls {
  coverImageUrl?: string
  coverImageThumbnailUrl?: string
}

/**
 * Both variants are always normalized to jpg on upload (regardless of the
 * source's original format) and stored under the same well-known prefix,
 * so the folder, extension, and a resized variant's `_${size}` suffix can
 * all be inferred from a bare `coverImageId` rather than stored per
 * record. The original has no suffix; pass `size` for a resized variant.
 */
export function coverImageUrlFromId(
  id: string,
  size?: number
): string {
  const suffix = size ? `_${size}` : ''
  return publicUrl(
    `${COVER_IMAGE_PATH_PREFIX}/${id}${suffix}.${COVER_IMAGE_EXTENSION}`
  )
}

/**
 * Attaches derived `coverImageUrl`/`coverImageThumbnailUrl` fields to a
 * fetched embed code, computed from its stored `coverImageId`. Must run
 * server-side (reads the storage env vars) — called from `data.ts` so the
 * URLs are already resolved by the time an embed code reaches the client,
 * e.g. as JSON from `/api/embed_codes`.
 */
export function withCoverImageUrls<
  T extends { coverImageId?: string }
>(embedCode: T): T & WithCoverImageUrls {
  if (!embedCode.coverImageId) return embedCode

  return {
    ...embedCode,
    coverImageUrl: coverImageUrlFromId(embedCode.coverImageId),
    coverImageThumbnailUrl: coverImageUrlFromId(
      embedCode.coverImageId,
      COVER_IMAGE_THUMBNAIL_SIZE
    )
  }
}

export function withEmbedCodeCoverImageUrls<
  T extends {
    embedCodes?: { coverImageId?: string }[]
  }
>(item: T) {
  return {
    ...item,
    embedCodes: item.embedCodes?.map(withCoverImageUrls)
  }
}
