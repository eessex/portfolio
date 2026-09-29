import {
  DEFAULT_TIME_ZONE,
  fromDateTimeInputValue,
  getUtcOffsetMinutes,
  getWallClockParts
} from '@/lib/dates'

describe('getWallClockParts', () => {
  it('renders the calendar parts of an instant in the given zone', () => {
    const parts = getWallClockParts(
      new Date('2024-01-15T17:30:45Z'),
      DEFAULT_TIME_ZONE
    )

    expect(parts).toEqual({
      year: 2024,
      month: 1,
      day: 15,
      hour: 12,
      minute: 30,
      second: 45
    })
  })

  it('follows daylight saving time', () => {
    const { hour } = getWallClockParts(
      new Date('2024-07-15T17:30:00Z'),
      DEFAULT_TIME_ZONE
    )

    expect(hour).toBe(13)
  })

  it('reports midnight as hour 0, never 24', () => {
    const { day, hour } = getWallClockParts(
      new Date('2024-01-15T05:00:00Z'),
      DEFAULT_TIME_ZONE
    )

    expect(day).toBe(15)
    expect(hour).toBe(0)
  })

  it('crosses the date line into the previous day', () => {
    const { year, month, day, hour } = getWallClockParts(
      new Date('2024-01-01T02:00:00Z'),
      DEFAULT_TIME_ZONE
    )

    expect({ year, month, day, hour }).toEqual({
      year: 2023,
      month: 12,
      day: 31,
      hour: 21
    })
  })
})

describe('getUtcOffsetMinutes', () => {
  it('returns the standard-time offset', () => {
    expect(
      getUtcOffsetMinutes('2024-01-15T17:30:00Z', DEFAULT_TIME_ZONE)
    ).toBe(-300)
  })

  it('returns the daylight-time offset', () => {
    expect(
      getUtcOffsetMinutes('2024-07-15T17:30:00Z', DEFAULT_TIME_ZONE)
    ).toBe(-240)
  })

  it('returns zero for UTC', () => {
    expect(getUtcOffsetMinutes('2024-01-15T17:30:00Z', 'UTC')).toBe(0)
  })

  it('accepts a Date as well as a string', () => {
    expect(
      getUtcOffsetMinutes(
        new Date('2024-01-15T17:30:00Z'),
        DEFAULT_TIME_ZONE
      )
    ).toBe(-300)
  })
})

describe('fromDateTimeInputValue', () => {
  it('reads a datetime-local value as wall-clock time in the zone', () => {
    expect(
      fromDateTimeInputValue('2024-01-15T12:30', DEFAULT_TIME_ZONE)
    ).toEqual(new Date('2024-01-15T17:30:00Z'))
  })

  it('applies daylight saving time', () => {
    expect(
      fromDateTimeInputValue('2024-07-15T13:30', DEFAULT_TIME_ZONE)
    ).toEqual(new Date('2024-07-15T17:30:00Z'))
  })

  it('defaults to DEFAULT_TIME_ZONE', () => {
    expect(fromDateTimeInputValue('2024-01-15T12:30')).toEqual(
      fromDateTimeInputValue('2024-01-15T12:30', DEFAULT_TIME_ZONE)
    )
  })

  it('parses a zoned ISO string as an absolute instant', () => {
    expect(
      fromDateTimeInputValue(
        '2024-01-15T12:30:00Z',
        DEFAULT_TIME_ZONE
      )
    ).toEqual(new Date('2024-01-15T12:30:00Z'))
  })

  it('parses an ISO string carrying seconds as an absolute instant', () => {
    expect(
      fromDateTimeInputValue(
        '2024-01-15T12:30:45.000Z',
        DEFAULT_TIME_ZONE
      )
    ).toEqual(new Date('2024-01-15T12:30:45.000Z'))
  })

  it('returns undefined for an unparseable value', () => {
    expect(
      fromDateTimeInputValue('not-a-date', DEFAULT_TIME_ZONE)
    ).toBeUndefined()
    expect(
      fromDateTimeInputValue('', DEFAULT_TIME_ZONE)
    ).toBeUndefined()
  })
})
