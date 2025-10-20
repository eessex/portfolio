import type { z } from 'zod'

import type { Link } from '@/lib/links/types'
import type { PublishedEditionClient } from '@/lib/published-editions/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageItemClient } from '@/lib/types'

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
  return result.charAt(0).toUpperCase() + result.slice(1)
}

export function snakeToCamel (str: string) {
  return str.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase())
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

function nullsToUndefined<T> (obj: T): T {
  if (obj === null) return undefined as unknown as T

  if (typeof obj === 'number') return obj as T
  if (typeof obj === 'boolean') return obj as T
  if (typeof obj === 'string') return obj as T
  if (obj instanceof Date) return obj

  if (Array.isArray(obj)) {
    return obj.map(nullsToUndefined) as unknown as T
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, nullsToUndefined(value)])
    ) as T
  }

  return obj
}

export function formatDbResponseForClient<T extends z.ZodTypeAny> (
  data: unknown,
  schema: T
): z.infer<T> {
  const formatted = nullsToUndefined(camelizeKeys(data))
  return schema.parse(formatted)
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

function singularizePath (path: string) {
  return path.endsWith('s') ? path.slice(0, -1) : path
}

export const formattedItemType = (type: string, isUpcoming = false, isPlural = false) => {
  let unformatted = snakeToCamel(type)

  switch (type) {
    case 'feature':
      unformatted = 'featuredOn'
      break
    case 'album':
      unformatted = 'soloRelease'
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
