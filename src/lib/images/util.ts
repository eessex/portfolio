// sharp's format name → stored extension and Content-Type
export const uploadFormats: Record<
  string,
  { ext: string; contentType: string }
> = {
  jpeg: { ext: 'jpg', contentType: 'image/jpeg' },
  png: { ext: 'png', contentType: 'image/png' },
  webp: { ext: 'webp', contentType: 'image/webp' },
  gif: { ext: 'gif', contentType: 'image/gif' },
  svg: { ext: 'svg', contentType: 'image/svg+xml' }
}

export const ACCEPTED_IMAGE_TYPES = Object.values(uploadFormats).map(
  ({ contentType }) => contentType
)

/** SVG only where a picker allows it: the site icon and logo. */
export function acceptedImageTypes(isSvgAllowed = false) {
  return isSvgAllowed
    ? ACCEPTED_IMAGE_TYPES
    : ACCEPTED_IMAGE_TYPES.filter(
        (type) => type !== uploadFormats.svg!.contentType
      )
}

export function acceptedFormatsText(isSvgAllowed = false) {
  return isSvgAllowed
    ? 'JPEG, PNG, WebP, GIF or SVG'
    : 'JPEG, PNG, WebP or GIF'
}

// Files still pass through a server action: Vercel caps its body at ~4.5 MB.
// New files may total 4 MB per save, leaving ~500 KB for the other fields
// and multipart overhead (tens of KB in practice).
export const MAX_UPLOAD_FILE_SIZE = 4 * 1000 * 1000
export const MAX_UPLOAD_REQUEST_SIZE = 4 * 1000 * 1000
export const SERVER_ACTION_BODY_SIZE_LIMIT = '4.5mb'

// Below this, nothing on the site looks right
export const MIN_SHORT_EDGE = 600

// per frame, so a crafted file can't exhaust memory when decoded
export const MAX_INPUT_PIXELS = 40_000_000

// every frame together, since variants decode them all; a real
// 441-frame 1265×704 GIF is 393 MP
export const MAX_ANIMATION_PIXELS = 500_000_000

/** width / height bounds; the images.aspect schema enforces them */
export const MIN_ASPECT = 0.1
export const MAX_ASPECT = 10

/** Widths served; next/image picks from these. */
export const IMAGE_FORMATS: ['image/webp'] = ['image/webp']
// 800: full-width covers on phones need 665–690px, just over 640
export const DEVICE_SIZES = [640, 800, 1200, 1600]
export const IMAGE_SIZES = [256]

// full-width content on mobile, inside the page's 16px side gutters
export const MOBILE_CONTENT_SIZE = 'calc(100vw - 32px)'

/** Every width served; each upload is written once per width as WebP. */
export const VARIANT_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES]

/** Bump to regenerate every image's variants with the backfill. */
export const VARIANT_VERSION = 1

export const OG_IMAGE_WIDTH = 1200

interface SizedImage {
  width?: number
  height?: number
  /** until every row has a size; embed covers have only this */
  aspect?: number
  variantVersion?: number
}

/**
 * width / height. A row's size is used once its variants are written,
 * since the backfill re-reads it after EXIF rotation and corrects its
 * aspect too; until then its saved aspect is kept, so nothing changes
 * before the backfill.
 */
export function imageAspect(image: SizedImage) {
  const isSizeOriented = (image.variantVersion ?? 0) > 0
  if (image.aspect && !isSizeOriented) return image.aspect
  if (image.width && image.height) return image.width / image.height
  return image.aspect ?? 1
}

interface VariantImage {
  url: string
  format?: string
  variantVersion?: number
}

/** Sanitized on upload and served as-is: no variants, no optimizer. */
export function isSvg(image: { format?: string }) {
  return image.format === 'svg'
}

/** Whether the image's WebP widths exist, ie it skips the optimizer. */
export function hasVariants(image: VariantImage) {
  return !!image.format && (image.variantVersion ?? 0) > 0
}

/**
 * The smallest variant at least `width` wide, else the largest. A
 * variant is never wider than its original, so it may be narrower.
 */
export function variantWidth(width: number) {
  return (
    VARIANT_WIDTHS.find((w) => w >= width) ??
    VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1]!
  )
}

/**
 * A variant's file name after its id. Versioned so a regenerated
 * variant gets a new URL past year-long caches.
 */
export function variantSuffix(width: number, version: number) {
  return `_v${version}_${width}.webp`
}

/**
 * A variant's URL from its original's: `images/{id}.{ext}` →
 * `images/{id}_v{n}_{w}.webp`, so the client needs no storage host.
 */
export function imageVariantUrl(
  originalUrl: string,
  width: number,
  version: number
) {
  return originalUrl.replace(
    /\.[a-z0-9]+$/i,
    variantSuffix(variantWidth(width), version)
  )
}

/**
 * Open Graph image: the 1200 variant at its true size, if it exists.
 * None for SVG, which link previews don't render.
 */
export function ogImage(image: SizedImage & VariantImage) {
  if (isSvg(image)) return undefined
  const aspect = imageAspect(image)
  if (!hasVariants(image)) {
    return {
      url: image.url,
      width: OG_IMAGE_WIDTH,
      height: Math.round(OG_IMAGE_WIDTH / aspect)
    }
  }
  const width = Math.min(
    OG_IMAGE_WIDTH,
    image.width ?? OG_IMAGE_WIDTH
  )
  return {
    url: imageVariantUrl(
      image.url,
      OG_IMAGE_WIDTH,
      image.variantVersion!
    ),
    width,
    height: Math.round(width / aspect),
    type: 'image/webp'
  }
}

export function formatMegabytes(bytes: number) {
  return `${Number((bytes / 1000 / 1000).toFixed(1))} MB`
}

/** Total size of the files a form submits, ie its new uploads. */
export function newFilesSize(formData: FormData) {
  let total = 0
  for (const value of formData.values()) {
    if (value instanceof File) total += value.size
  }
  return total
}

export function badAspectMessage(name: string) {
  return `"${name}" is too long and thin. Choose an image no more than ${MAX_ASPECT} times as wide as it is tall, or as tall as it is wide`
}

export function tooManyPixelsMessage(name: string) {
  return `"${name}" is too large. Choose an image of at most ${MAX_INPUT_PIXELS / 1_000_000} megapixels`
}

export function animationTooLargeMessage(name: string) {
  return `"${name}" has too many frames for its size. Choose a shorter or smaller animation`
}

export function tooSmallMessage(name: string) {
  return `"${name}" is too small. Choose an image at least ${MIN_SHORT_EDGE}px on its short edge`
}
