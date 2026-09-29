import {
  DEFAULT_TIME_ZONE,
  fromDateTimeInputValue
} from '@/lib/dates'
import { toDateInputValue, toDateTimeInputValue } from '@/ui/util'

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
