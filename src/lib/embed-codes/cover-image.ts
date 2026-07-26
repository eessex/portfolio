import sharp from 'sharp'

import {
  COVER_IMAGE_EXTENSION,
  COVER_IMAGE_PATH_PREFIX,
  COVER_IMAGE_THUMBNAIL_SIZE
} from '@/lib/embed-codes/cover-image-url'
import {
  extractYoutubeVideoId,
  resolveOEmbed
} from '@/lib/embed-codes/oembed'
import {
  type EmbedCodeHost,
  EmbedCodeHosts
} from '@/lib/embed-codes/schemas/db'
import { uploadBufferToS3 } from '@/lib/images/s3'

function warnNonOkResponse(
  label: string,
  url: string,
  res: Response
): void {
  console.warn(
    `[cover-image] ${label} request failed: ${res.status} ${res.statusText} for ${url}`
  )
}

function toJpegBuffer(
  buffer: Buffer,
  resizeToThumbnail?: boolean
): Promise<Buffer> {
  const image = sharp(buffer)
  if (resizeToThumbnail) {
    image.resize({
      width: COVER_IMAGE_THUMBNAIL_SIZE,
      height: COVER_IMAGE_THUMBNAIL_SIZE,
      fit: 'inside',
      withoutEnlargement: true
    })
  }
  return image
    .jpeg({ quality: resizeToThumbnail ? 80 : 90 })
    .toBuffer()
}

export interface EmbedCodeMetadata {
  coverImageId?: string
  title?: string
}

async function fetchThumbnailImage(
  host: EmbedCodeHost,
  src: string,
  fallbackUrl: string
): Promise<Response | undefined> {
  const videoId =
    host === EmbedCodeHosts.youtube
      ? extractYoutubeVideoId(src)
      : undefined
  if (videoId) {
    const maxresUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    const maxresRes = await fetch(maxresUrl)
    if (maxresRes.ok) return maxresRes
  }

  const res = await fetch(fallbackUrl)
  if (!res.ok) {
    warnNonOkResponse('resolved thumbnail', fallbackUrl, res)
    return undefined
  }
  return res
}

/**
 * Fetches metadata for a newly created embed code from its source — every
 * host except `unknown` is supported (youtube, soundcloud, bandcamp,
 * mixcloud, spotify, vimeo). Never throws: any failure (unsupported
 * host, dead link, network error, unprocessable image) just omits the
 * corresponding field so it can't block saving the embed code.
 */
export async function fetchEmbedCodeMetadata(
  host: EmbedCodeHost,
  src: string
): Promise<EmbedCodeMetadata> {
  try {
    const resolved = await resolveOEmbed(host, src)
    if (!resolved?.thumbnailUrl) return { title: resolved?.title }

    const imageRes = await fetchThumbnailImage(
      host,
      src,
      resolved.thumbnailUrl
    )
    if (!imageRes) return { title: resolved.title }

    const buffer = Buffer.from(await imageRes.arrayBuffer())
    const id = crypto.randomUUID()
    const key = `${COVER_IMAGE_PATH_PREFIX}/${id}`

    const [fullBuffer, thumbnailBuffer] = await Promise.all([
      toJpegBuffer(buffer),
      toJpegBuffer(buffer, true)
    ])

    await Promise.all([
      uploadBufferToS3({
        buffer: fullBuffer,
        contentType: 'image/jpeg',
        key: `${key}.${COVER_IMAGE_EXTENSION}`
      }),
      uploadBufferToS3({
        buffer: thumbnailBuffer,
        contentType: 'image/jpeg',
        key: `${key}_${COVER_IMAGE_THUMBNAIL_SIZE}.${COVER_IMAGE_EXTENSION}`
      })
    ])

    return { coverImageId: id, title: resolved.title }
  } catch (cause) {
    console.error('Failed to fetch embed code metadata:', cause)
    return {}
  }
}
