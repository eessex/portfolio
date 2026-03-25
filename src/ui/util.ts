import type { DashboardUsedOnPagesKeys } from '@/lib/embed-codes/types'
import type { Image } from '@/lib/images/types'
import type { Link } from '@/lib/links/types'
import type { PublishedEditionClient } from '@/lib/published-editions/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageItemClient } from '@/lib/types'
import type { Venue } from '@/lib/venues/types'
import type { DashboardItem } from '@/ui/dashboard/dashboard-items'

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

export function getUtcOffsetMinutes (utcDate: string | Date, timeZone: string): number {
  const date = new Date(utcDate)

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(date)

  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10)
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10)
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10)
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10)
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10)
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10)

  const localTzTimestamp = Date.UTC(year, month - 1, day, hour, minute, second)

  const offsetMs = localTzTimestamp - date.getTime()

  return offsetMs / 60000
}

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

export function formattedDateTime (utcDate: string | Date, format?: DateFormatSize, tz?: Intl.DateTimeFormatOptions['timeZone']) {
  const timeZone = tz || 'America/New_York'
  const startTime = new Date(utcDate)
  const offsetMinutes = getUtcOffsetMinutes(startTime, timeZone)
  const adjustedTime = startTime.getTime() - offsetMinutes * 60 * 1000
  const localDate = format === 'xs' || format === 'xxs' ? new Date(startTime) : new Date(adjustedTime)

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    ...getTimeFormat(format),
    timeZone
  }).format(localDate)

  return formattedDate
}

export function escapeHtml (s: string) {
  return s.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function isUpcomingDate (date: string | Date) {
  return new Date(date) > new Date()
}

export function camelToSentence (str: string) {
  const result = str.replace(/([A-Z])/g, ' $1')
  // Replace "And" with "&"
  const resultWithAmp = result.replace(/\bAnd\b/g, '&')
  return capitalizeFirstLetter(resultWithAmp)
}

export function snakeToCamel (str: string) {
  return str.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase())
}

export function camelToSnake (str: string) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export function capitalizeFirstLetter (string: string) {
  if (typeof string !== 'string' || string.length === 0) {
    return string
  }
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function camelizeKeys (obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const camelizedObject: Record<string, unknown> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key.toString())) {
      const camelKey = snakeToCamel(key)
      camelizedObject[camelKey] = obj[key]
    }
  }
  return camelizedObject
}

export function eventUrl (slug: string) {
  return `/events/${slug}`
}

export function releaseUrl (slug: string) {
  return `/releases/${slug}`
}

export function projectUrl (slug: string) {
  return `/projects/${slug}`
}

export function filteredLinksByPress (links: Array<Link>) {
  const sortByDate = (a: Link, b: Link) => {
    const aDate = new Date(a.publishDate ?? a.createdAt)
    const bDate = new Date(b.publishDate ?? b.createdAt)
    return bDate.getTime() - aDate.getTime()
  }

  const pressLinks: Array<Link> = []
  const otherLinks: Array<Link> = []

  links.forEach((link) => {
    (link.type === 'press' ? pressLinks : otherLinks).push(link)
  })

  pressLinks.sort(sortByDate)
  otherLinks.sort(sortByDate)

  return [pressLinks, otherLinks]
}

export function combinePublishedEditions (publishedEditions: ReleaseClient['publishedEditions']) {
  const combined: Array<Omit<PublishedEditionClient, 'format'> & { formats?: string[], format?: string }> = []
  if (!publishedEditions || publishedEditions.length === 0) return combined

  publishedEditions.forEach((edition) => {
    const existing = combined.find(item => (
      item.publisher === edition.publisher &&
      new Date(item.publishDate).toISOString().substring(0, 10) ===
      new Date(edition.publishDate).toISOString().substring(0, 10)
    ))
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
  combined.forEach(item => {
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

export function singularizePath (path: string) {
  return path.endsWith('s') ? path.slice(0, -1) : path
}

export function itemTypeToLabel (itemType: string, isSingular = false, isDownCased = false) {
  let formatted = camelToSentence(itemType)
  if (isDownCased) {
    formatted = formatted.toLowerCase()
  }
  return isSingular
    ? singularizePath(formatted)
    : formatted
}

export const formattedItemType = (type: string, isUpcoming = false, isPlural = false) => {
  let unformatted = snakeToCamel(type)

  switch (type) {
    case 'feature':
      unformatted = 'featuredOn'
      break
  }
  return `${isUpcoming ? ' Upcoming ' : ''} ${camelToSentence(isPlural ? unformatted : singularizePath(unformatted))}`
}

export function formattedItemTitle (item: PageItemClient) {
  const { artist } = item as ReleaseClient
  return artist ? `${artist}: ${item.title}` : item.title
}

export function itemUrl (item: PageItemClient) {
  return `/${item.path}/${item.slug}`
}

// queried on page fetch, but not returned in save actions,
// extract these keys so we can store them when editing items
export function usedOnSlugKeys ({
  eventSlugs,
  projectSlugs,
  releaseSlugs
}: DashboardItem): Pick<DashboardUsedOnPagesKeys, 'eventSlugs' | 'projectSlugs' | 'releaseSlugs'> {
  return ({
    eventSlugs: eventSlugs ?? [],
    projectSlugs: projectSlugs ?? [],
    releaseSlugs: releaseSlugs ?? []
  })
}

export function usedOnPages (item: Partial<DashboardItem>) {
  const events = item.eventSlugs?.map(i => eventUrl(i)) || []
  const projects = item.projectSlugs?.map(i => projectUrl(i)) || []
  const releases =
      'releaseSlugs' in item && Array.isArray(item.releaseSlugs)
        ? item.releaseSlugs.map(i => releaseUrl(i))
        : []
  const about = []
  if ((item as Link).type === 'press' || (item as Image).isPress) {
    if (!(item as Link | Image).isHiddenOnAboutPage) {
      about.push('/about')
    }
  }

  return [
    ...events,
    ...releases,
    ...projects,
    ...about
  ]
}

export function formatVenueInline ({
  venue,
  format,
  isNameHidden
}: {
  venue: Omit<Venue, 'id'>
  format?: 'sm' | 'lg'
  isNameHidden?: boolean
}): string {
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

type BaseParams = {
  query?: string
  cursor?: string
} & Record<string, string | number | boolean | undefined | null>

export function buildApiUrl (endpoint: string, params?: BaseParams) {
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
