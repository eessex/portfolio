export const COVER_IMAGE_PATH_PREFIX = 'embedCodeCoverImages'
export const COVER_IMAGE_EXTENSION = 'jpg'

/**
 * Bounding box (width and height, since resizing preserves aspect within
 * it) for the resized thumbnail variant, also used as its filename suffix
 * — see `coverImageUrlFromId`. `CoverImageThumbnail` renders this at
 * 32px tall with no `sizes` prop, so `next/image` treats it as a fixed
 * size and requests a 1x/2x pair from `next.config.ts`'s `imageSizes`
 * (`[52, 96, 256]`) — the 2x request for any width up to ~86px (covering
 * every host's aspect ratio this app currently fetches covers for) rounds
 * up to the `96` step, so 96 is the smallest size that avoids upscaling
 * on retina screens.
 */
export const COVER_IMAGE_THUMBNAIL_SIZE = 96

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
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${COVER_IMAGE_PATH_PREFIX}/${id}${suffix}.${COVER_IMAGE_EXTENSION}`
}

/**
 * Attaches derived `coverImageUrl`/`coverImageThumbnailUrl` fields to a
 * fetched embed code, computed from its stored `coverImageId`. Must run
 * server-side (reads `AWS_S3_*` env vars) — called from `data.ts` so the
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
