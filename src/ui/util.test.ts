import {
  DEFAULT_TIME_ZONE,
  fromDateTimeInputValue
} from '@/lib/dates'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import {
  formattedDateOrTimestamp,
  formattedDateTime,
  formattedLinkUrl,
  itemUrl,
  toDateInputValue,
  toDateTimeInputValue
} from '@/ui/util'

describe('toDateInputValue', () => {
  it('returns an empty string for missing dates', () => {
    expect(toDateInputValue(undefined)).toBe('')
    expect(toDateInputValue('')).toBe('')
  })

  it('returns an empty string for invalid dates', () => {
    expect(toDateInputValue('not-a-date')).toBe('')
  })

  it('formats a Date from local calendar parts', () => {
    const localMidnight = new Date(2024, 0, 15)
    expect(toDateInputValue(localMidnight)).toBe('2024-01-15')
  })

  it('does not shift the day east of UTC', () => {
    const newYear = new Date(2024, 0, 1)
    expect(toDateInputValue(newYear)).toBe('2024-01-01')
  })

  it('formats an ISO date string', () => {
    expect(toDateInputValue('2024-06-30T00:00:00.000Z')).toBe(
      toDateInputValue(new Date('2024-06-30T00:00:00.000Z'))
    )
  })
})

describe('toDateTimeInputValue', () => {
  it('returns an empty string for missing dates', () => {
    expect(toDateTimeInputValue(undefined)).toBe('')
    expect(toDateTimeInputValue('')).toBe('')
  })

  it('returns an empty string for invalid dates', () => {
    expect(toDateTimeInputValue('not-a-date')).toBe('')
  })

  it('renders an instant as wall-clock time in the given zone', () => {
    expect(
      toDateTimeInputValue(
        '2024-01-15T17:30:00.000Z',
        DEFAULT_TIME_ZONE
      )
    ).toBe('2024-01-15T12:30')
  })

  it('follows daylight saving time', () => {
    expect(
      toDateTimeInputValue(
        '2024-07-15T17:30:00.000Z',
        DEFAULT_TIME_ZONE
      )
    ).toBe('2024-07-15T13:30')
  })

  it('zero-pads every part', () => {
    expect(
      toDateTimeInputValue(
        '2024-01-05T14:05:00.000Z',
        DEFAULT_TIME_ZONE
      )
    ).toBe('2024-01-05T09:05')
  })

  it('renders midnight as 00, not 24', () => {
    expect(
      toDateTimeInputValue(
        '2024-01-15T05:00:00.000Z',
        DEFAULT_TIME_ZONE
      )
    ).toBe('2024-01-15T00:00')
  })

  it('falls back to local calendar parts with no zone', () => {
    const local = new Date(2024, 0, 5, 9, 5)
    expect(toDateTimeInputValue(local)).toBe('2024-01-05T09:05')
  })

  it('round-trips through fromDateTimeInputValue', () => {
    const instant = new Date('2024-07-15T17:30:00.000Z')
    expect(
      fromDateTimeInputValue(
        toDateTimeInputValue(instant, DEFAULT_TIME_ZONE),
        DEFAULT_TIME_ZONE
      )
    ).toEqual(instant)
  })
})

describe('formattedDateTime', () => {
  it('keeps the calendar date of a DATE value in xs/xxs', () => {
    // neon returns DATE 2025-01-01 as local (UTC) midnight
    const date = new Date('2025-01-01T00:00:00Z')

    expect(formattedDateTime(date, 'xxs')).toBe('2025')
    expect(formattedDateTime(date, 'xs')).toBe('Jan 2025')
  })
})

describe('formattedDateOrTimestamp', () => {
  // 9pm Jan 31 in New York
  const createdAt = new Date('2026-02-01T02:00:00Z')

  it('formats the DATE when set', () => {
    const publishDate = new Date('2025-03-01T00:00:00Z')

    expect(
      formattedDateOrTimestamp(publishDate, createdAt, 'xs')
    ).toBe('Mar 2025')
  })

  it('formats a timestamp fallback in DEFAULT_TIME_ZONE', () => {
    expect(formattedDateOrTimestamp(undefined, createdAt, 'xs')).toBe(
      'Jan 2026'
    )
  })
})

describe('formattedLinkUrl', () => {
  it('drops www. and the trailing slash from a root URL', () => {
    expect(formattedLinkUrl('https://www.example.com/')).toBe(
      'example.com'
    )
  })

  it('drops the trailing slash from a nested path', () => {
    expect(
      formattedLinkUrl('https://example.com/press/review/?ref=x#top')
    ).toBe('example.com/press/review')
  })

  it('returns the input unchanged when it is not a valid URL', () => {
    expect(formattedLinkUrl('not a url')).toBe('not a url')
  })
})

describe('itemUrl', () => {
  it('links a page item to its slug', () => {
    expect(itemUrl(projectFixtureBand)).toBe(
      `/projects/${projectFixtureBand.slug}`
    )
  })

  it('links the default project to /about', () => {
    expect(
      itemUrl({ ...projectFixtureBand, isDefaultProject: true })
    ).toBe('/about')
  })
})
