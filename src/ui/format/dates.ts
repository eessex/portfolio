import {
  DEFAULT_TIME_ZONE,
  getUtcOffsetMinutes,
  getWallClockParts
} from '@/lib/dates'

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
