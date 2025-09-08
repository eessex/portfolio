import type { Link as _Link } from '@/lib/links/types'
import type { PublishedEditionClient } from '@/lib/published-edition/types'
import type { z } from 'zod'

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

const dateFormatXxs: Intl.DateTimeFormatOptions = {
  year: 'numeric'
}

type DateFormatSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'

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

export function formattedDateTime (date: string | Date, format?: DateFormatSize, timeZone?: Intl.DateTimeFormatOptions['timeZone']) {
  const startTime = new Date(date)
  startTime.setHours(startTime.getHours())
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    ...getTimeFormat(format),
    timeZone: timeZone || 'America/New_York',
  }).format(startTime)

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

export function filteredLinksByPress (links: Array<_Link>) {
  const sortByDate = (a: _Link, b: _Link) => {
    const aDate = new Date(a.publishDate ?? a.createdAt)
    const bDate = new Date(b.publishDate ?? b.createdAt)
    return bDate.getTime() - aDate.getTime()
  }

  const pressLinks: Array<_Link> = []
  const otherLinks: Array<_Link> = []

  links.forEach((link) => {
    (link.type === 'press' ? pressLinks : otherLinks).push(link)
  })

  pressLinks.sort(sortByDate)
  otherLinks.sort(sortByDate)

  return [pressLinks, otherLinks]
}

export function combinePublishedEditions (editions: Array<PublishedEditionClient>) {
  const combined: Array<Omit<PublishedEditionClient, 'format'> & { formats?: string[], format?: string }> = []

  editions.forEach((edition) => {
    const existing = combined.find(item => item.publisher === edition.publisher && item.publishDate === edition.publishDate)
    if (!existing) {
      combined.push({
        ...edition,
        formats: [edition.format],
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
