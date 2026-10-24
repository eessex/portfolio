/**
 * Pure transforms from mongoexport documents to row drafts, for
 * scripts/migrate-mongo.ts. No DB, network or storage access, so
 * everything here is unit-tested.
 */
import type { EmbedCodeHost } from '@/lib/embed-codes/schemas/db'
import type { ImageType } from '@/lib/images/schemas/db'
import { type LinkType, LinkTypes } from '@/lib/links/schemas/db'
import {
  type PublishedEditionType,
  publishedEditionTypes
} from '@/lib/published-editions/schemas/db'
import {
  type ReleaseType,
  ReleaseTypes
} from '@/lib/releases/schemas'
import {
  isHttpsUrl,
  MAX_STRING_LENGTH_LONG,
  MAX_STRING_LENGTH_SHORT
} from '@/lib/schemas/primitives'
import type { VenueTimezone } from '@/lib/venues/schemas/db'
import {
  extractHostFromUrl,
  extractHostnameType
} from '@/ui/embed-codes/util'

export const collections = [
  'events',
  'projects',
  'publications',
  'pages',
  'settings'
] as const
export type Collection = (typeof collections)[number]

export type MongoDoc = Record<string, unknown>

/**
 * `fail` keeps the item out, `skip` drops one embedded item and keeps
 * its parent, `warn` writes it but flags it for review.
 */
export interface Issue {
  level: 'fail' | 'skip' | 'warn'
  message: string
}

export interface ImageRef {
  url: string
  caption?: string
  type?: ImageType
}

export interface LinkRef {
  url: string
  title?: string
  type?: LinkType
  isFromDescription?: boolean
}

export interface EmbedRef {
  src: string
  host: EmbedCodeHost
  type: 'audio' | 'video'
}

export interface VenueDraft {
  name?: string
  address?: string
  city: string
  state?: string
  country?: string
  timezone: VenueTimezone
  isTimezoneGuessed: boolean
  /** normalized canonical name; one name can have several locations */
  nameKey: string
  /** normalized `city|address` within that name */
  locationKey: string
  /** `nameKey|locationKey`, the legacy_ids key */
  key: string
}

export interface ContentDraft {
  mongoId: string
  title: string
  slug: string
  description?: string
  shortDescription?: string
  isPublished: boolean
  createdAt?: Date
  updatedAt?: Date
  images: ImageRef[]
  embeds: EmbedRef[]
  links: LinkRef[]
  issues: Issue[]
  lossy: string[]
}

export interface EventDraft extends ContentDraft {
  startTime?: Date
  endTime?: Date
  mongoProjectIds: string[]
  venue?: VenueDraft
}

export interface EditionDraft {
  format: PublishedEditionType
  /** YYYY-MM-DD */
  publishDate: string
  /** blank means the built-in Self-released publisher */
  publisherName?: string
}

export interface ReleaseDraft extends ContentDraft {
  artist?: string
  type: ReleaseType
  mongoProjectIds: string[]
  editions: EditionDraft[]
  /** YYYY-MM-DD, the earliest edition's */
  releaseDate?: string
}

export interface ProjectDraft extends ContentDraft {
  startDate?: string
  endDate?: string
  isDefaultProject: boolean
}

export interface SettingsDraft {
  mongoId: string
  title?: string
  description?: string
  coverImage?: ImageRef
  socialLinks: LinkRef[]
  issues: Issue[]
}

/**
 * mongoexport writes Extended JSON (`{"$oid": …}`, `{"$date": …}`);
 * this unwraps it to plain strings and numbers.
 */
export function fromExtendedJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromExtendedJson)
  if (!value || typeof value !== 'object') return value
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj)
  if (keys.length === 1) {
    const [key] = keys
    const inner = obj[key]
    if (key === '$oid') return String(inner)
    if (key === '$date') {
      if (inner && typeof inner === 'object') {
        // canonical form: {"$date": {"$numberLong": "…"}}
        const ms = Number(
          (inner as { $numberLong?: string }).$numberLong
        )
        return new Date(ms).toISOString()
      }
      return typeof inner === 'number'
        ? new Date(inner).toISOString()
        : String(inner)
    }
    if (
      key === '$numberInt' ||
      key === '$numberLong' ||
      key === '$numberDouble' ||
      key === '$numberDecimal'
    ) {
      return Number(inner)
    }
  }
  return Object.fromEntries(
    keys.map((key) => [key, fromExtendedJson(obj[key])])
  )
}

/** A `--jsonArray` export, or the default one-document-per-line. */
export function parseMongoExport(text: string): MongoDoc[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  const docs = trimmed.startsWith('[')
    ? (JSON.parse(trimmed) as unknown[])
    : trimmed
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line) as unknown)
  return docs.map((doc) => fromExtendedJson(doc) as MongoDoc)
}

const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  copy: '©',
  gt: '>',
  hellip: '…',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  rdquo: '”',
  rsquo: '’'
}

export function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (match, code: string) => {
      if (code.startsWith('#')) {
        const isHex = code[1].toLowerCase() === 'x'
        const point = parseInt(
          code.slice(isHex ? 2 : 1),
          isHex ? 16 : 10
        )
        return point > 0 && point <= 0x10ffff
          ? String.fromCodePoint(point)
          : match
      }
      return namedEntities[code.toLowerCase()] ?? match
    }
  )
}

function stripTags(html: string) {
  return html.replace(/<[^>]*>/g, '')
}

/** Trims, and turns blank into undefined. */
export function clean(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return
  const text = String(value).trim()
  return text || undefined
}

// formatting the conversion keeps (as line breaks) or moves (links)
const keptTags = new Set(['p', 'br', 'a'])

/**
 * Converts draft-js HTML to plain text for `white-space: pre-line`:
 * `</p>` becomes a blank line, `<br>` a newline, tags are stripped
 * and entities decoded. Each `<a href>` becomes a link entry and its
 * words stay in the text. `droppedTags` names the formatting lost.
 */
export function htmlToText(html: unknown): {
  text: string
  links: LinkRef[]
  droppedTags: string[]
} {
  if (typeof html !== 'string' || !html.trim()) {
    return { text: '', links: [], droppedTags: [] }
  }
  const links: LinkRef[] = []
  const dropped = new Set<string>()
  for (const [, name] of html.matchAll(/<\/?([a-z][a-z0-9]*)\b/gi)) {
    const tag = name.toLowerCase()
    if (!keptTags.has(tag)) dropped.add(tag)
  }
  let text = html
    .replace(/\r\n?/g, '\n')
    .replace(
      /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi,
      (_match, dq, sq, bare, inner: string) => {
        const url = decodeEntities(String(dq ?? sq ?? bare).trim())
        const title = decodeEntities(stripTags(inner))
          .replace(/\s+/g, ' ')
          .trim()
        if (url) {
          links.push({
            url,
            title: title || undefined,
            isFromDescription: true
          })
        }
        return inner
      }
    )
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<\/(div|li|h[1-6]|blockquote)\s*>/gi, '\n')
  text = decodeEntities(stripTags(text))
    .replace(/ /g, ' ')
    // control characters pasted in from other editors
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
  text = text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return { text, links, droppedTags: [...dropped].sort() }
}

/** The `src` of an embed's iframe, entities decoded. */
export function parseIframeSrc(html: unknown): string | undefined {
  if (typeof html !== 'string') return
  const match = html.match(
    /<iframe\b[^>]*?\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
  )
  if (!match) return
  const src = decodeEntities(
    (match[1] ?? match[2] ?? match[3]).trim()
  )
  if (!src) return
  return src.startsWith('//') ? `https:${src}` : src
}

const editionFormatAliases: Record<string, PublishedEditionType> = {
  '2lp': '2xLP',
  'double lp': '2xLP',
  '12"': 'LP',
  '12”': 'LP',
  '12″': 'LP',
  '12 inch': 'LP',
  vinyl: 'LP',
  '2cassette': '2xCassette',
  'double cassette': '2xCassette',
  cs: 'Cassette',
  tape: 'Cassette',
  'compact disc': 'CD',
  download: 'Digital',
  'digital download': 'Digital',
  'ios app': 'iOSApp',
  'iphone app': 'iOSApp',
  app: 'iOSApp'
}

/**
 * An old edition format onto `publishedEditionTypes`, or undefined
 * when it has no exact counterpart (`7"`, `Box set`): those need a
 * decision, so the release fails rather than guess.
 */
export function mapEditionFormat(
  format: unknown
): PublishedEditionType | undefined {
  const name = clean(format)
  if (!name) return
  const key = name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^(\d)\s*x\s*/, '$1x')
  const exact = publishedEditionTypes.find(
    (type) => type.toLowerCase() === key
  )
  return exact ?? editionFormatAliases[key]
}

const purchaseTitle = /\b(buy|purchase|order|pre-?order|shop)\b/i
const streamingHosts = [
  'spotify.com',
  'music.apple.com',
  'music.youtube.com',
  'tidal.com',
  'deezer.com'
]

/** Mongo links have no type: a purchase title wins over a streaming host. */
export function inferLinkType(
  title: string | undefined,
  url: string
): LinkType | undefined {
  if (title && purchaseTitle.test(title)) return LinkTypes.buyLink
  let hostname: string
  try {
    hostname = new URL(url).hostname
      .toLowerCase()
      .replace(/^www\./, '')
  } catch {
    return
  }
  if (
    streamingHosts.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    )
  ) {
    return LinkTypes.streamLink
  }
}

export function toLinkRef(
  link: { title?: unknown; url?: unknown },
  isFromDescription = false
): { link?: LinkRef; issue?: Issue; lossy?: string } {
  let url = clean(link.url)
  const title = clean(link.title)
  const label = `link ${url ?? '(no url)'}`
  if (!url)
    return { issue: { level: 'skip', message: `${label}: no url` } }
  try {
    new URL(url)
  } catch {
    return {
      issue: { level: 'skip', message: `${label}: invalid url` }
    }
  }
  // old links predate the https rule; most of those sites serve both
  let lossy: string | undefined
  if (/^http:\/\//i.test(url)) {
    url = url.replace(/^http:/i, 'https:')
    lossy = `${label}: upgraded to https`
  }
  if (!isHttpsUrl(url)) {
    return {
      issue: { level: 'skip', message: `${label}: not https` }
    }
  }
  if (url.length > MAX_STRING_LENGTH_SHORT) {
    return {
      issue: {
        level: 'skip',
        message: `${label}: url over 255 characters`
      }
    }
  }
  return {
    link: {
      url,
      title: title?.slice(0, MAX_STRING_LENGTH_SHORT),
      type: inferLinkType(title, url),
      ...(isFromDescription && { isFromDescription })
    },
    lossy
  }
}

export function toEmbedRef(html: unknown): {
  embed?: EmbedRef
  issue?: Issue
} {
  const src = parseIframeSrc(html)
  if (!src) {
    return {
      issue: { level: 'skip', message: 'embed code: no iframe src' }
    }
  }
  if (!isHttpsUrl(src)) {
    return {
      issue: {
        level: 'skip',
        message: `embed code ${src}: not https`
      }
    }
  }
  if (src.length > 1000) {
    return {
      issue: {
        level: 'skip',
        message: `embed code ${src.slice(0, 80)}…: src over 1000 characters`
      }
    }
  }
  const host = extractHostFromUrl(src)
  return { embed: { src, host, type: extractHostnameType(host) } }
}

export function toImageRef(
  image: { url?: unknown; caption?: unknown; title?: unknown },
  type?: ImageType
): { image?: ImageRef; issues: Issue[]; lossy: string[] } {
  const url = clean(image.url)
  if (!url) {
    return {
      issues: [{ level: 'skip', message: 'image: no url' }],
      lossy: []
    }
  }
  const lossy: string[] = []
  // some old images keep their caption in `title`
  let caption =
    htmlToText(image.caption ?? image.title).text || undefined
  if (caption && caption.length > MAX_STRING_LENGTH_SHORT) {
    lossy.push(
      `image ${url}: caption cut to ${MAX_STRING_LENGTH_SHORT} characters`
    )
    caption = `${caption.slice(0, MAX_STRING_LENGTH_SHORT - 1)}…`
  }
  return {
    image: { url, caption, ...(type && { type }) },
    issues: [],
    lossy
  }
}

/** An ISO string or Date, else undefined. */
export function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' && !(value instanceof Date)) return
  const date = new Date(value)
  return isNaN(date.getTime()) ? undefined : date
}

function toDateOnly(value: unknown): string | undefined {
  return parseDate(value)?.toISOString().slice(0, 10)
}

/** `project_ids`, else the older single `project_id` some docs kept. */
function projectIdsOf(doc: MongoDoc): string[] {
  const ids = stringArray(doc.project_ids)
  const single = clean(doc.project_id)
  return ids.length || !single ? ids : [single]
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((v) => clean(v)).filter((v): v is string => !!v)
    : []
}

function objectArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter(
        (v): v is Record<string, unknown> =>
          !!v && typeof v === 'object'
      )
    : []
}

/** The fields every page item shares. */
export function toContent(
  doc: MongoDoc,
  imageType?: ImageType
): ContentDraft {
  const issues: Issue[] = []
  const lossy: string[] = []
  const mongoId = clean(doc._id) ?? ''
  const title = clean(doc.title) ?? ''
  const slug = clean(doc.slug) ?? ''
  if (!mongoId) issues.push({ level: 'fail', message: 'no _id' })
  if (!title) issues.push({ level: 'fail', message: 'no title' })
  if (!slug) issues.push({ level: 'fail', message: 'no slug' })

  const converted = htmlToText(doc.description)
  const description = converted.text || undefined
  if (description && description.length > MAX_STRING_LENGTH_LONG) {
    issues.push({
      level: 'fail',
      message:
        `description is ${description.length} characters after conversion ` +
        `(max ${MAX_STRING_LENGTH_LONG}):\n${description}`
    })
  }
  if (converted.droppedTags.length) {
    lossy.push(
      `description: dropped ${converted.droppedTags.map((t) => `<${t}>`).join(', ')}`
    )
  }
  if (converted.links.length) {
    lossy.push(
      `description: ${converted.links.length} link(s) also added as link entries`
    )
  }

  const meta = (doc.meta ?? {}) as { description?: unknown }
  const shortDescription =
    htmlToText(meta.description).text || undefined

  const images: ImageRef[] = []
  for (const raw of objectArray(doc.images)) {
    const result = toImageRef(raw, imageType)
    issues.push(...result.issues)
    lossy.push(...result.lossy)
    if (
      result.image &&
      !images.some((i) => i.url === result.image!.url)
    ) {
      images.push(result.image)
    }
  }

  const embeds: EmbedRef[] = []
  for (const html of Array.isArray(doc.embed_codes)
    ? doc.embed_codes
    : []) {
    const { embed, issue } = toEmbedRef(html)
    if (issue) issues.push(issue)
    if (
      embed &&
      !embeds.some(
        (e) => e.src === embed.src && e.type === embed.type
      )
    ) {
      embeds.push(embed)
    }
  }

  // the item's own links first, then those pulled from its description
  const links: LinkRef[] = []
  for (const [raw, isFromDescription] of [
    ...objectArray(doc.links).map((l) => [l, false] as const),
    ...converted.links.map((l) => [l, true] as const)
  ]) {
    const {
      link,
      issue,
      lossy: note
    } = toLinkRef(raw, isFromDescription)
    if (issue) issues.push(issue)
    if (note) lossy.push(note)
    if (link && !links.some((l) => l.url === link.url))
      links.push(link)
  }

  return {
    mongoId,
    title,
    slug,
    description,
    shortDescription,
    isPublished: doc.published === true,
    createdAt: parseDate(doc.created_at),
    updatedAt: parseDate(doc.updated_at),
    images,
    embeds,
    links,
    issues,
    lossy
  }
}

/** Lowercase, no accents or punctuation, `&` as "and". */
export function normalizeKey(value: unknown): string {
  return (
    (clean(value) ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      // Honey's and Honeys are one name
      .replace(/['’]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  )
}

const addressWords: Record<string, string> = {
  avenue: 'ave',
  boulevard: 'blvd',
  place: 'pl',
  road: 'rd',
  street: 'st'
}

export function normalizeAddress(value: unknown): string {
  return normalizeKey(value)
    .split(' ')
    .map((word) => addressWords[word] ?? word)
    .join(' ')
}

/**
 * Old spellings → the one canonical venue name every location shares.
 * Keys are compared normalized; extend with `venue-aliases.json` in the
 * export folder.
 */
export const defaultVenueAliases: Record<string, string> = {
  'ISSUE Project Room, Brooklyn': 'ISSUE Project Room'
}

export function normalizeAliases(
  aliases: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(aliases).map(([from, to]) => [
      normalizeKey(from),
      to
    ])
  )
}

const cityTimezones: Record<string, VenueTimezone> =
  Object.fromEntries(
    (
      [
        [
          'America/New_York',
          [
            'new york',
            'nyc',
            'brooklyn',
            'queens',
            'manhattan',
            'bronx',
            'staten island',
            'ridgewood',
            'long island city',
            'jersey city',
            'hudson',
            'philadelphia',
            'boston',
            'providence',
            'washington',
            'washington dc',
            'washington d c',
            'baltimore',
            'pittsburgh',
            'atlanta',
            'miami',
            'detroit',
            'toronto',
            'montreal'
          ]
        ],
        [
          'America/Chicago',
          [
            'chicago',
            'minneapolis',
            'milwaukee',
            'st louis',
            'new orleans',
            'nashville',
            'houston',
            'austin',
            'dallas'
          ]
        ],
        ['America/Denver', ['denver', 'santa fe', 'salt lake city']],
        [
          'America/Los_Angeles',
          [
            'los angeles',
            'san francisco',
            'oakland',
            'seattle',
            'portland',
            'vancouver'
          ]
        ],
        ['America/Mexico_City', ['mexico city', 'ciudad de mexico']],
        ['America/Sao_Paulo', ['sao paulo', 'rio de janeiro']],
        ['America/Bogota', ['bogota']],
        ['Atlantic/Reykjavik', ['reykjavik']],
        [
          'Europe/London',
          [
            'london',
            'glasgow',
            'manchester',
            'bristol',
            'dublin',
            'lisbon'
          ]
        ],
        [
          'Europe/Paris',
          [
            'paris',
            'brussels',
            'amsterdam',
            'rotterdam',
            'madrid',
            'barcelona',
            'rome',
            'milan',
            'turin',
            'vienna',
            'zurich',
            'geneva',
            'basel',
            'oslo',
            'stockholm',
            'copenhagen'
          ]
        ],
        [
          'Europe/Berlin',
          [
            'berlin',
            'hamburg',
            'munich',
            'cologne',
            'frankfurt',
            'leipzig',
            'prague',
            'warsaw',
            'krakow',
            'budapest'
          ]
        ],
        [
          'Europe/Helsinki',
          ['helsinki', 'athens', 'vilnius', 'riga', 'kyiv']
        ],
        ['Europe/Istanbul', ['istanbul']],
        ['Europe/Moscow', ['moscow', 'st petersburg']],
        ['Asia/Tokyo', ['tokyo', 'osaka', 'kyoto']],
        ['Asia/Seoul', ['seoul']],
        [
          'Asia/Shanghai',
          ['shanghai', 'beijing', 'hong kong', 'taipei']
        ],
        ['Australia/Sydney', ['sydney', 'melbourne']],
        ['Pacific/Auckland', ['auckland', 'wellington']]
      ] as const
    ).flatMap(([zone, cities]) => cities.map((city) => [city, zone]))
  )

const usStateTimezones: Record<string, VenueTimezone> =
  Object.fromEntries(
    (
      [
        [
          'America/New_York',
          'ny ct nj pa ma ri vt nh me de md dc va wv nc sc ga fl oh mi'
        ],
        ['America/Chicago', 'il wi mn ia mo la tn al ms ar ok tx'],
        ['America/Denver', 'co nm ut wy mt'],
        ['America/Los_Angeles', 'ca wa or nv']
      ] as const
    ).flatMap(([zone, states]) =>
      states.split(' ').map((state) => [state, zone])
    )
  )

const usCountryNames = [
  'us',
  'usa',
  'united states',
  'united states of america'
]

// countries with states or provinces that share US abbreviations
const statedCountries = ['australia', 'brazil', 'canada', 'india']

const countryTimezones: Record<string, VenueTimezone> = {
  'united kingdom': 'Europe/London',
  uk: 'Europe/London',
  england: 'Europe/London',
  scotland: 'Europe/London',
  ireland: 'Europe/London',
  portugal: 'Europe/London',
  france: 'Europe/Paris',
  belgium: 'Europe/Paris',
  netherlands: 'Europe/Paris',
  spain: 'Europe/Paris',
  italy: 'Europe/Paris',
  switzerland: 'Europe/Paris',
  austria: 'Europe/Paris',
  norway: 'Europe/Paris',
  sweden: 'Europe/Paris',
  denmark: 'Europe/Paris',
  germany: 'Europe/Berlin',
  poland: 'Europe/Berlin',
  'czech republic': 'Europe/Berlin',
  hungary: 'Europe/Berlin',
  finland: 'Europe/Helsinki',
  greece: 'Europe/Helsinki',
  japan: 'Asia/Tokyo',
  mexico: 'America/Mexico_City'
}

export const DEFAULT_VENUE_TIMEZONE: VenueTimezone =
  'America/New_York'

/**
 * By US state (unambiguous, unlike a city: Portland, ME), then city,
 * then country; else the default, flagged.
 */
export function venueTimezone(venue: {
  city?: string
  state?: string
  country?: string
}): { timezone: VenueTimezone; isGuessed: boolean } {
  const country = normalizeKey(venue.country)
  // a known country other than the US; old venues sometimes put a
  // street in `country`, which shouldn't hide their state
  const isForeign =
    !!country &&
    !usCountryNames.includes(country) &&
    (country in countryTimezones || statedCountries.includes(country))
  const timezone =
    (isForeign
      ? undefined
      : usStateTimezones[normalizeKey(venue.state)]) ??
    cityTimezones[normalizeKey(venue.city)] ??
    countryTimezones[country]
  return timezone
    ? { timezone, isGuessed: false }
    : { timezone: DEFAULT_VENUE_TIMEZONE, isGuessed: true }
}

/** The one address a venue name is set to, from venue-locations.json. */
export interface VenueLocation {
  address?: string
  city?: string
  state?: string
  country?: string
}

export function normalizeVenueLocations(
  locations: Record<string, VenueLocation>
): Record<string, VenueLocation> {
  return Object.fromEntries(
    Object.entries(locations).map(([name, location]) => [
      normalizeKey(name),
      location
    ])
  )
}

/**
 * An event's embedded venue, its name run through the alias map and
 * its address through the set locations.
 */
export function toVenue(
  venue: unknown,
  aliases: Record<string, string> = normalizeAliases(
    defaultVenueAliases
  ),
  locations: Record<string, VenueLocation> = {}
): { venue?: VenueDraft; issues: Issue[] } {
  const rawName = clean((venue as { name?: unknown } | null)?.name)
  const name = (rawName && aliases[normalizeKey(rawName)]) ?? rawName
  // a set location replaces every spelling of the venue's address
  const v = {
    ...((venue ?? {}) as Record<string, unknown>),
    ...(name && locations[normalizeKey(name)])
  }
  const city = clean(v.city)
  if (!city) {
    return {
      issues: [
        {
          level: 'fail',
          message: `venue "${rawName ?? '(no name)'}" has no city; fill venue.city in the export`
        }
      ]
    }
  }
  const address = clean(v.address)
  const state = clean(v.state)
  const country = clean(v.country)
  const { timezone, isGuessed } = venueTimezone({
    city,
    state,
    country
  })
  const nameKey = normalizeKey(name)
  const locationKey = `${normalizeKey(city)}|${normalizeAddress(address)}`
  const issues: Issue[] = []
  if (isGuessed) {
    issues.push({
      level: 'warn',
      message: `venue "${name ?? city}": no timezone known for ${[city, state, country].filter(Boolean).join(', ')}; using ${timezone}`
    })
  }
  return {
    venue: {
      name,
      address,
      city,
      state,
      country,
      timezone,
      isTimezoneGuessed: isGuessed,
      nameKey,
      locationKey,
      key: `${nameKey}|${locationKey}`
    },
    issues
  }
}

export function toEvent(
  doc: MongoDoc,
  aliases?: Record<string, string>,
  locations?: Record<string, VenueLocation>
): EventDraft {
  const content = toContent(doc, 'flyer')
  const issues = [...content.issues]
  const startTime = parseDate(doc.start_date)
  if (!startTime)
    issues.push({ level: 'fail', message: 'no start_date' })
  const { venue, issues: venueIssues } = toVenue(
    doc.venue,
    aliases,
    locations
  )
  issues.push(...venueIssues)
  const mongoProjectIds = projectIdsOf(doc)
  if (mongoProjectIds.length > 1) {
    issues.push({
      level: 'warn',
      message: `${mongoProjectIds.length} projects; only the first is kept`
    })
  }
  return {
    ...content,
    issues,
    startTime,
    endTime: parseDate(doc.end_date),
    mongoProjectIds,
    venue
  }
}

export function toRelease(doc: MongoDoc): ReleaseDraft {
  const content = toContent(doc)
  const issues = [...content.issues]
  const editions: EditionDraft[] = []
  const formats = objectArray(doc.formats)
  if (!formats.length) {
    issues.push({
      level: 'fail',
      message: 'no formats, so no edition to date the release by'
    })
  }
  for (const raw of formats) {
    const format = mapEditionFormat(raw.format)
    const year = Number(raw.release_year)
    if (!format) {
      issues.push({
        level: 'fail',
        message: `unmapped edition format "${clean(raw.format) ?? ''}"`
      })
    }
    if (!Number.isInteger(year) || year < 1000) {
      issues.push({
        level: 'fail',
        message: `edition "${clean(raw.format) ?? ''}" has no release_year`
      })
    }
    if (format && Number.isInteger(year) && year >= 1000) {
      editions.push({
        format,
        publishDate: `${year}-01-01`,
        publisherName: clean(raw.publisher)
      })
    }
  }
  const releaseDate = editions
    .map((e) => e.publishDate)
    .sort()
    .at(0)
  return {
    ...content,
    issues,
    artist: clean(doc.artist),
    type: ReleaseTypes.album,
    mongoProjectIds: projectIdsOf(doc),
    editions,
    releaseDate
  }
}

export function toProject(doc: MongoDoc): ProjectDraft {
  return {
    ...toContent(doc),
    startDate: toDateOnly(doc.start_date),
    endDate: toDateOnly(doc.end_date),
    isDefaultProject: false
  }
}

export const DEFAULT_PROJECT_PAGE_SLUG = 'info'

/** The `info` page becomes the default project; other pages aren't migrated. */
export function toDefaultProject(
  doc: MongoDoc
): ProjectDraft | undefined {
  if (clean(doc.slug) !== DEFAULT_PROJECT_PAGE_SLUG) return
  return { ...toProject(doc), isDefaultProject: true }
}

/** As the old site's footer built it. */
export function socialProfileUrl(service: string, profile: string) {
  if (/^https?:\/\//i.test(profile)) return profile
  return service === 'bandcamp'
    ? `https://${profile}.bandcamp.com/`
    : `https://${service}.com/${profile}`
}

export function toSettings(doc: MongoDoc): SettingsDraft {
  const issues: Issue[] = []
  const meta = (doc.meta ?? {}) as {
    description?: unknown
    image?: unknown
  }
  const description =
    htmlToText(doc.description).text ||
    htmlToText(meta.description).text ||
    undefined
  if (description && description.length > MAX_STRING_LENGTH_SHORT) {
    issues.push({
      level: 'fail',
      message: `description is ${description.length} characters (max ${MAX_STRING_LENGTH_SHORT})`
    })
  }
  const socialLinks: LinkRef[] = []
  for (const raw of objectArray(doc.social)) {
    const service = clean(raw.service)?.toLowerCase()
    const profile = clean(raw.profile)
    if (!service || !profile) continue
    const { link, issue } = toLinkRef({
      title: service[0].toUpperCase() + service.slice(1),
      url: socialProfileUrl(service, profile)
    })
    if (issue) issues.push(issue)
    if (link) socialLinks.push({ ...link, type: LinkTypes.social })
  }
  const imageUrl = clean(meta.image)
  return {
    mongoId: clean(doc._id) ?? '',
    title: clean(doc.title),
    description,
    coverImage: imageUrl ? { url: imageUrl } : undefined,
    socialLinks,
    issues
  }
}

/**
 * Old uploads are keyed by their raw file name, so each path segment
 * is encoded before fetching (spaces, `&`, `#`, non-ASCII), over https.
 */
export function encodeImageUrl(url: string): string {
  const match = url.match(/^(https?:\/\/[^/]+)(\/.*)?$/i)
  if (!match) return url
  const [, origin, path = ''] = match
  const encoded = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${origin.replace(/^http:/i, 'https:')}${encoded}`
}

/** An old url's object key, as uploaded (decoded). */
export function oldImageKey(url: string): string {
  const match = url.match(/^https?:\/\/[^/]+\/(.*)$/i)
  // raw file names, so a `#` or `?` is part of the name
  const path = match?.[1] ?? ''
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

export function oldImageFilename(url: string): string | undefined {
  return (
    oldImageKey(url)
      .split('/')
      .pop()
      ?.slice(0, MAX_STRING_LENGTH_SHORT) || undefined
  )
}
