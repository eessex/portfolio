export const OG_IMAGE_WIDTH = 1200

/** Open Graph width/height for an image; `aspect` is width / height. */
export function ogImageSize(aspect: number) {
  return {
    width: OG_IMAGE_WIDTH,
    height: Math.round(OG_IMAGE_WIDTH / aspect)
  }
}

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
