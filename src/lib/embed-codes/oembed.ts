import {
  type EmbedCodeHost,
  EmbedCodeHosts
} from '@/lib/embed-codes/schemas/db'

const YOUTUBE_ID_PATTERN =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/|live\/))([\w-]{11})/

export function extractYoutubeVideoId(
  src: string
): string | undefined {
  return src.match(YOUTUBE_ID_PATTERN)?.[1]
}

/**
 * `URLSearchParams` only decodes one layer of percent-encoding, but some
 * widget markup (observed: SoundCloud's `url` param) double-encodes it —
 * keep decoding while it still looks percent-encoded, bounded so a
 * pathological value can't loop forever.
 */
function fullyDecodeUriComponent(value: string): string {
  let decoded = value
  for (let i = 0; i < 5 && /%[0-9A-Fa-f]{2}/.test(decoded); i++) {
    const next = decodeURIComponent(decoded)
    if (next === decoded) break
    decoded = next
  }
  return decoded
}

/**
 * Pasting a full `<iframe>` stores its literal `src` attribute, which for
 * soundcloud/mixcloud is a widget URL wrapping the actual content URL in
 * a query param — oEmbed only recognizes the unwrapped URL (verified:
 * the widget domain 400s/404s). Pasting a bare URL instead stores the
 * canonical URL directly, in which case the param won't be present and
 * `src` is returned as-is.
 */
function unwrapEmbedSrc(
  src: string,
  wrappedUrlParam: string
): string {
  try {
    const wrapped = new URL(src).searchParams.get(wrappedUrlParam)
    return wrapped ? fullyDecodeUriComponent(wrapped) : src
  } catch {
    return src
  }
}

/**
 * SoundCloud's widget sometimes wraps the track as a URN
 * (`.../tracks/soundcloud:tracks:{id}`) rather than a bare numeric id —
 * oEmbed 404s on the URN form (verified) but accepts `.../tracks/{id}`.
 */
const SOUNDCLOUD_URN_SUFFIX_PATTERN = /soundcloud:[a-z]+:(\d+)$/i

function normalizeSoundcloudTrackUrl(url: string): string {
  return url.replace(SOUNDCLOUD_URN_SUFFIX_PATTERN, '$1')
}

function warnNonOkResponse(
  label: string,
  url: string,
  res: Response
): void {
  console.warn(
    `[oembed] ${label} request failed: ${res.status} ${res.statusText} for ${url}`
  )
}

/**
 * What we can opportunistically pull from a host's oEmbed response —
 * besides the thumbnail, oEmbed also returns a canonical `title`, so any
 * host we already call oEmbed for a cover image can enrich the title for
 * free in the same request.
 */
export interface ResolvedOEmbed {
  thumbnailUrl?: string
  title?: string
}

async function youtubeOEmbedMeta(
  src: string
): Promise<ResolvedOEmbed | undefined> {
  const videoId = extractYoutubeVideoId(src)
  if (!videoId) return undefined

  // oEmbed requires the canonical watch URL — verified it 404s on the
  // /embed/ iframe src form (unlike Vimeo, which accepts its player src
  // as-is).
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    warnNonOkResponse('youtube oEmbed', oembedUrl, res)
    return undefined
  }
  const data = (await res.json()) as {
    thumbnail_url?: string
    title?: string
  }
  return { thumbnailUrl: data.thumbnail_url, title: data.title }
}

async function soundcloudOEmbedMeta(
  src: string
): Promise<ResolvedOEmbed | undefined> {
  const canonicalUrl = normalizeSoundcloudTrackUrl(
    unwrapEmbedSrc(src, 'url')
  )
  const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(canonicalUrl)}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    warnNonOkResponse('soundcloud oEmbed', oembedUrl, res)
    return undefined
  }
  const data = (await res.json()) as {
    thumbnail_url?: string
    title?: string
  }
  return { thumbnailUrl: data.thumbnail_url, title: data.title }
}

async function mixcloudOEmbedMeta(
  src: string
): Promise<ResolvedOEmbed | undefined> {
  const canonicalUrl = unwrapEmbedSrc(src, 'feed')
  const oembedUrl = `https://www.mixcloud.com/oembed/?format=json&url=${encodeURIComponent(canonicalUrl)}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    warnNonOkResponse('mixcloud oEmbed', oembedUrl, res)
    return undefined
  }
  // Mixcloud's oEmbed puts the thumbnail in `image`, not `thumbnail_url`
  // like the other three hosts.
  const data = (await res.json()) as {
    image?: string
    title?: string
  }
  return { thumbnailUrl: data.image, title: data.title }
}

async function spotifyOEmbedMeta(
  src: string
): Promise<ResolvedOEmbed | undefined> {
  // Its iframe src is .../embed/{type}/{id} — oEmbed only recognizes the
  // unwrapped .../{type}/{id} form (verified: the /embed/ form times out).
  const canonicalUrl = src.replace(
    'open.spotify.com/embed/',
    'open.spotify.com/'
  )
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(canonicalUrl)}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    warnNonOkResponse('spotify oEmbed', oembedUrl, res)
    return undefined
  }
  const data = (await res.json()) as {
    thumbnail_url?: string
    title?: string
  }
  return { thumbnailUrl: data.thumbnail_url, title: data.title }
}

async function vimeoOEmbedMeta(
  src: string
): Promise<ResolvedOEmbed | undefined> {
  // Unlike soundcloud/mixcloud/spotify, Vimeo's oEmbed scheme explicitly
  // recognizes the player.vimeo.com/video/{id} iframe src directly — no
  // unwrapping needed (verified).
  const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(src)}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    warnNonOkResponse('vimeo oEmbed', oembedUrl, res)
    return undefined
  }
  const data = (await res.json()) as {
    thumbnail_url?: string
    title?: string
  }
  return { thumbnailUrl: data.thumbnail_url, title: data.title }
}

const BANDCAMP_ARTWORK_PATTERN =
  /https:\/\/f4\.bcbits\.com\/img\/a\d+_\d+\.jpg/

/**
 * Bandcamp's EmbeddedPlayer page has no `<title>`/meta title — the page
 * is a near-empty shell that renders client-side from a `data-player-data`
 * JSON blob (HTML-entity-encoded) on the player `<script>` tag, which has
 * the album title/artist and every track's own title. `src` carries which
 * track is showing as a `track=<id>` path segment (absent for a
 * whole-album embed, in which case the album title is what we've got).
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

interface BandcampPlayerTrack {
  id: number
  title: string
  artist?: string
}

interface BandcampPlayerData {
  album_title?: string
  artist?: string
  tracks?: BandcampPlayerTrack[]
}

function parseBandcampPlayerData(
  html: string
): BandcampPlayerData | undefined {
  const match = html.match(/\sdata-player-data="([^"]*)"/)
  if (!match) return undefined
  try {
    return JSON.parse(decodeHtmlEntities(match[1]))
  } catch (cause) {
    console.warn(
      '[oembed] bandcamp embed page had unparseable data-player-data',
      cause
    )
    return undefined
  }
}

function bandcampTrackTitle(
  data: BandcampPlayerData,
  src: string
): string | undefined {
  const trackId = Number(src.match(/track=(\d+)/)?.[1])
  const track = Number.isNaN(trackId)
    ? undefined
    : data.tracks?.find((t) => t.id === trackId)

  const title = track?.title || data.album_title
  const artist = track?.artist || data.artist
  if (!title) return undefined

  return artist ? `${title} by ${artist}` : title
}

async function bandcampMeta(
  src: string
): Promise<ResolvedOEmbed | undefined> {
  const res = await fetch(src)
  if (!res.ok) {
    warnNonOkResponse('bandcamp embed page', src, res)
    return undefined
  }
  const html = await res.text()
  const thumbnailUrl = html.match(BANDCAMP_ARTWORK_PATTERN)?.[0]
  if (!thumbnailUrl) {
    console.warn(
      `[oembed] bandcamp embed page had no matching artwork url: ${src}`
    )
  }

  const playerData = parseBandcampPlayerData(html)
  const title = playerData
    ? bandcampTrackTitle(playerData, src)
    : undefined

  return { thumbnailUrl, title }
}

/**
 * Resolves a host's oEmbed (or oEmbed-like scrape) response. Kept in its
 * own sharp-free module so it can be imported from both
 * `cover-image.ts` (the sharp cover-image pipeline, at create time)
 * and `preview-metadata.ts` (a lightweight client-callable preview, at
 * paste time) without either one pulling in the other's dependencies.
 */
export async function resolveOEmbed(
  host: EmbedCodeHost,
  src: string
): Promise<ResolvedOEmbed | undefined> {
  switch (host) {
    case EmbedCodeHosts.youtube:
      return youtubeOEmbedMeta(src)
    case EmbedCodeHosts.soundcloud:
      return soundcloudOEmbedMeta(src)
    case EmbedCodeHosts.bandcamp:
      return bandcampMeta(src)
    case EmbedCodeHosts.mixcloud:
      return mixcloudOEmbedMeta(src)
    case EmbedCodeHosts.spotify:
      return spotifyOEmbedMeta(src)
    case EmbedCodeHosts.vimeo:
      return vimeoOEmbedMeta(src)
    default:
      return undefined
  }
}
