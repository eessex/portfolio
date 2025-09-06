import type { Link as _Link } from '@/lib/definitions'
import { z } from 'zod'

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

export function formattedDateTime (date: string, format?: DateFormatSize, timeZone?: Intl.DateTimeFormatOptions['timeZone']) {
  const startDate = new Date(date)
  startDate.setHours(startDate.getHours())
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    ...getTimeFormat(format),
    timeZone: timeZone || 'America/New_York',
  }).format(startDate)

  return formattedDate
}

export function escapeHtml (s: string) {
  return s.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function isUpcomingDate (date: string) {
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
  const pressLinks: Array<_Link> = []
  const otherLinks: Array<_Link> = []

  links.forEach((link) => {
    (link.type === 'press' ? pressLinks : otherLinks).push(link)
  })
  return [pressLinks, otherLinks]
}
