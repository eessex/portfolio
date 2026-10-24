// sharp's format name → stored extension and Content-Type
export const uploadFormats: Record<
  string,
  { ext: string; contentType: string }
> = {
  jpeg: { ext: 'jpg', contentType: 'image/jpeg' },
  png: { ext: 'png', contentType: 'image/png' },
  webp: { ext: 'webp', contentType: 'image/webp' },
  gif: { ext: 'gif', contentType: 'image/gif' }
}

export const ACCEPTED_IMAGE_TYPES = Object.values(uploadFormats).map(
  ({ contentType }) => contentType
)

// Files still pass through a server action: Vercel caps its body at ~4.5 MB.
// New files may total 4 MB per save, leaving ~500 KB for the other fields
// and multipart overhead (tens of KB in practice).
export const MAX_UPLOAD_FILE_SIZE = 4 * 1000 * 1000
export const MAX_UPLOAD_REQUEST_SIZE = 4 * 1000 * 1000
export const SERVER_ACTION_BODY_SIZE_LIMIT = '4.5mb'

// Below this, nothing on the site looks right
export const MIN_SHORT_EDGE = 600

/** Widths served; next/image picks from these. */
export const IMAGE_FORMATS: ['image/webp'] = ['image/webp']
// 800: full-width covers on phones need 665–690px, just over 640
export const DEVICE_SIZES = [640, 800, 1200, 1600]
export const IMAGE_SIZES = [256]

// full-width content on mobile, inside the page's 16px side gutters
export const MOBILE_CONTENT_SIZE = 'calc(100vw - 32px)'

export const OG_IMAGE_WIDTH = 1200

/** Open Graph width/height for an image; `aspect` is width / height. */
export function ogImageSize(aspect: number) {
  return {
    width: OG_IMAGE_WIDTH,
    height: Math.round(OG_IMAGE_WIDTH / aspect)
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

export function tooSmallMessage(name: string) {
  return `"${name}" is too small. Choose an image at least ${MIN_SHORT_EDGE}px on its short edge`
}
