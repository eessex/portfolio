/** Fallback zone when an event has no venue timezone yet. */
export const DEFAULT_TIME_ZONE = 'America/New_York'

interface WallClockParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

/** The wall-clock calendar parts of `date` as rendered in `timeZone`. */
export function getWallClockParts(
  date: Date,
  timeZone: string
): WallClockParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date)

  const part = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value || '0', 10)

  return {
    year: part('year'),
    month: part('month'),
    day: part('day'),
    // `hour12: false` emits 24 for midnight in some engines
    hour: part('hour') % 24,
    minute: part('minute'),
    second: part('second')
  }
}

/** Minutes `timeZone`'s wall clock is ahead of UTC at `utcDate`. */
export function getUtcOffsetMinutes(
  utcDate: string | Date,
  timeZone: string
): number {
  const date = new Date(utcDate)
  const { year, month, day, hour, minute, second } =
    getWallClockParts(date, timeZone)
  const localTzTimestamp = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  )

  return (localTzTimestamp - date.getTime()) / 60000
}

/**
 * Inverse of `toDateTimeInputValue`: read a naive `datetime-local`
 * string (`YYYY-MM-DDTHH:mm`) as wall-clock time in `timeZone` and
 * return the matching UTC instant. Off by an hour only inside the ~1h
 * DST transition window, where a wall-clock time is ambiguous anyway.
 * Non-`datetime-local` strings fall back to a plain `Date` parse.
 */
export function fromDateTimeInputValue(
  value: string,
  timeZone: string = DEFAULT_TIME_ZONE
): Date | undefined {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  )
  if (!match) {
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }
  const [, year, month, day, hour, minute] = match
  const asUtc = Date.UTC(+year, +month - 1, +day, +hour, +minute)
  const offset = getUtcOffsetMinutes(new Date(asUtc), timeZone)
  return new Date(asUtc - offset * 60000)
}
