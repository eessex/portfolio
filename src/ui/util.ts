import {
  DEFAULT_TIME_ZONE,
  getUtcOffsetMinutes,
  getWallClockParts
} from '@/lib/dates'
import type { DashboardEmbedCode } from '@/lib/embed-codes/schemas/client'
import type { DashboardImage } from '@/lib/images/schemas/client'
import type { DashboardLink } from '@/lib/links/schemas/client'
import type { ProjectClient } from '@/lib/projects/types'
import type { PublishedEditionClient } from '@/lib/published-editions/schemas/client'
import type { DashboardPublisher } from '@/lib/publishers/schemas/client'
import type { ReleaseClient } from '@/lib/releases/types'
import {
  ABOUT_PATH,
  type EmbeddedItemType,
  EmbeddedItemTypes,
  type PagePath,
  PagePaths,
  singularizePath
} from '@/lib/schemas'
import { camelToSentence, snakeToCamel } from '@/lib/strings'
import type { PageItemClient } from '@/lib/types'
import type { DashboardVenue } from '@/lib/venues/schemas/client'
import type { Venue } from '@/lib/venues/schemas/db'

/**
 * A fetched embedded item extended with the pages that embed it,
 * used by dashboard listings (e.g. `usedOnPages()`).
 */
export type DashboardItem =
  | DashboardEmbedCode
  | DashboardImage
  | DashboardLink
  | DashboardPublisher
  | DashboardVenue

const dateFormatLg: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
}

const dateFormatMd: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}

const dateFormatXs: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short'
}

const dateFormatXxs: Intl.DateTimeFormatOptions = { year: 'numeric' }

export type DateFormatSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'

const getTimeFormat = (format: DateFormatSize = 'lg') => {
  switch (format) {
    case 'xxs':
      return dateFormatXxs
    case 'xs':
      return dateFormatXs
    case 'md':
      return dateFormatMd
    default:
      return dateFormatLg
  }
}

export function formattedDateTime(
  utcDate: string | Date,
  format?: DateFormatSize,
  tz?: Intl.DateTimeFormatOptions['timeZone']
) {
  const date = new Date(utcDate)

  if (tz) {
    return new Intl.DateTimeFormat('en-US', {
      ...getTimeFormat(format),
      timeZone: tz
    }).format(date)
  }

  if (format === 'xs' || format === 'xxs') {
    return new Intl.DateTimeFormat('en-US', {
      ...getTimeFormat(format),
      timeZone: 'UTC'
    }).format(date)
  }

  const offsetMinutes = getUtcOffsetMinutes(date, DEFAULT_TIME_ZONE)
  const adjustedTime = date.getTime() - offsetMinutes * 60 * 1000

  return new Intl.DateTimeFormat('en-US', {
    ...getTimeFormat(format),
    timeZone: DEFAULT_TIME_ZONE
  }).format(new Date(adjustedTime))
}

/**
 * Formats a Postgres `DATE` (e.g. `publishDate`) or, when it's unset,
 * the `TIMESTAMP` fallback (e.g. `createdAt`). xs/xxs assume a `DATE`
 * and format in UTC, so a timestamp fallback is pinned to
 * DEFAULT_TIME_ZONE instead.
 */
export function formattedDateOrTimestamp(
  date: string | Date | undefined,
  timestamp: string | Date,
  format?: DateFormatSize
) {
  return date
    ? formattedDateTime(date, format)
    : formattedDateTime(timestamp, format, DEFAULT_TIME_ZONE)
}

/**
 * Format a date-only value for a `type='date'` input.
 * UTC midnight (a parsed `'YYYY-MM-DD'`, or the neon driver on a UTC
 * server) reads as UTC; anything else (neon's local-midnight `DATE`
 * on a non-UTC server) reads as local.
 */
export function toDateInputValue(date?: Date | string) {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const isUtcMidnight = d.getTime() % 86_400_000 === 0
  const year = isUtcMidnight ? d.getUTCFullYear() : d.getFullYear()
  const month = isUtcMidnight ? d.getUTCMonth() : d.getMonth()
  const day = isUtcMidnight ? d.getUTCDate() : d.getDate()
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Format a datetime for a `type='datetime-local'` input
 * (`YYYY-MM-DDTHH:mm`) pass a timeZone or omit it to use local calendar parts.
 * Inverse of `fromDateTimeInputValue` in `@/lib/dates`.
 */
export function toDateTimeInputValue(
  date?: Date | string,
  timeZone?: string
) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (timeZone) {
    const { year, month, day, hour, minute } = getWallClockParts(
      d,
      timeZone
    )
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`
  }

  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}T${hours}:${minutes}`
}

export function eventUrl(slug: string) {
  return `/${PagePaths.events}/${slug}`
}

export function releaseUrl(slug: string) {
  return `/${PagePaths.releases}/${slug}`
}

export function projectUrl(slug: string) {
  return `/${PagePaths.projects}/${slug}`
}

/** Just the filename, e.g. an S3 url's key basename. */
export function formattedFilename(url: string) {
  try {
    return decodeURIComponent(
      new URL(url).pathname.split('/').pop() || url
    )
  } catch {
    return url
  }
}

/** Hostname + path, omitting the protocol and any query/hash. */
export function formattedLinkUrl(url: string) {
  try {
    const { hostname, pathname } = new URL(url)
    const host = hostname.replace(/^www\./, '')
    return `${host}${pathname}`.replace(/\/$/, '')
  } catch {
    return url
  }
}

export function combinePublishedEditions(
  publishedEditions: ReleaseClient['publishedEditions']
) {
  const combined: Array<
    Omit<PublishedEditionClient, 'format'> & {
      formats?: string[]
      format?: string
    }
  > = []
  if (!publishedEditions || publishedEditions.length === 0)
    return combined

  publishedEditions.forEach((edition) => {
    const existing = combined.find(
      (item) =>
        item.publisher?.id === edition.publisher?.id &&
        new Date(item.publishDate).toISOString().substring(0, 10) ===
          new Date(edition.publishDate).toISOString().substring(0, 10)
    )
    if (!existing) {
      combined.push({
        ...edition,
        formats: [edition.format]
      })
    } else {
      existing.formats = existing.formats || []
      existing.formats.push(edition.format)
    }
  })

  // Format the formats array into a grammatical list, e.g., "LP, Cassette & Digital"
  combined.forEach((item) => {
    if (item.formats?.length === 1) {
      item.format = item.formats[0]
    } else if (item.formats?.length === 2) {
      item.format = `${item.formats[0]} & ${item.formats[1]}`
    } else {
      item.format = `${item.formats?.slice(0, -1).join(', ')} & ${item.formats?.[item.formats.length - 1]}`
    }
    delete item.formats
  })
  return combined
}

export function isEmbeddedItemType(
  itemType: EmbeddedItemType | PagePath
): itemType is EmbeddedItemType {
  return itemType in EmbeddedItemTypes
}

/**
 * Per-embedded-item-type image column visibility, so items-table
 * can hide the column rather than leave it blank for types with no
 * cover image of their own.
 */
const embeddedItemColumns: Record<
  EmbeddedItemType,
  { hasImage: boolean }
> = {
  embedCodes: { hasImage: true },
  images: { hasImage: true },
  links: { hasImage: false },
  publishedEditions: { hasImage: true },
  publishers: { hasImage: false },
  venues: { hasImage: false }
}

export function isImageColumnVisible(
  itemType: EmbeddedItemType | PagePath
) {
  return (
    !isEmbeddedItemType(itemType) ||
    embeddedItemColumns[itemType].hasImage
  )
}

export function isEmbeddedDetailColumnVisible(
  itemType: EmbeddedItemType | PagePath
) {
  return isEmbeddedItemType(itemType)
}

export const formattedItemType = (
  type: string,
  isUpcoming = false,
  isPlural = false
) => {
  let unformatted = snakeToCamel(type)

  switch (type) {
    case 'feature':
      unformatted = 'featuredOn'
      break
  }
  // fixme
  return `${isUpcoming ? ' Upcoming ' : ''} ${camelToSentence(isPlural ? unformatted : singularizePath(unformatted as EmbeddedItemType))}`
}

export function formattedItemTitle(item: PageItemClient) {
  const { artist, displayArtist = artist } = item as ReleaseClient
  return displayArtist
    ? `${displayArtist}: ${item.title}`
    : item.title
}

export function itemUrl(item: PageItemClient) {
  if ((item as ProjectClient).isDefaultProject)
    return `/${ABOUT_PATH}`
  return `/${item.path}/${item.slug}`
}

export function usedOnPages(item: Partial<DashboardItem>) {
  const events =
    'eventSlugs' in item && Array.isArray(item.eventSlugs)
      ? item.eventSlugs.map((i) => eventUrl(i))
      : []
  const projects =
    'projectSlugs' in item && Array.isArray(item.projectSlugs)
      ? item.projectSlugs.map((i) => projectUrl(i))
      : []
  const releases =
    'releaseSlugs' in item && Array.isArray(item.releaseSlugs)
      ? item.releaseSlugs.map((i) => releaseUrl(i))
      : []
  return [...events, ...releases, ...projects]
}

export function formatVenueInline({
  venue,
  format,
  isNameHidden
}: {
  venue: Partial<Venue>
  format?: 'sm' | 'lg'
  isNameHidden?: boolean
}): string {
  if (!venue) return ''
  const parts: string[] = []

  if (isNameHidden) {
    if (venue.address) parts.push(venue.address)
    if (venue.city) parts.push(venue.city)
    if (venue.state) parts.push(venue.state)
    if (venue.country) parts.push(venue.country)
    return parts.join(', ')
  }

  if (format === 'sm') {
    if (venue.name) {
      parts.push(`${venue.name}:`)
    } else if (venue.address) {
      parts.push(venue.address)
    }
    if (venue.city) parts.push(venue.city)
    if (venue.state) parts.push(venue.state)
    if (venue.country) parts.push(venue.country)
    return parts.join(', ').replace(':,', ':').trim()
  }

  if (venue.name) parts.push(`${venue.name}:`)
  if (venue.address) parts.push(venue.address)
  if (venue.city) parts.push(venue.city)
  if (venue.state) parts.push(venue.state)
  if (venue.country) parts.push(venue.country)
  return parts.join(', ').replace(':,', ':').trim()
}

/**
 * Params a caller may forward to a client API.
 */
export type SearchParams = {
  /** Scope fetches to a parent project (e.g. on project pages) */
  projectId?: string
  /** Restrict images to a type, e.g. 'press' for the press-photo pickers */
  type?: string
  /** Restrict links to press (`true`) or non-press (`false`) links */
  isPress?: boolean
  /** Leave out the default project (the `/projects` index) */
  isDefaultExcluded?: boolean
}

type UrlParams = {
  query?: string
  cursor?: string
} & SearchParams

export function buildApiUrl(endpoint: string, params?: UrlParams) {
  const searchParams = new URLSearchParams()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    })
  }

  const queryString = searchParams.toString()
  return queryString ? `${endpoint}?${queryString}` : endpoint
}
