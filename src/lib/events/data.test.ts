import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import {
  eventFixturePast,
  eventFixtureUpcoming
} from '@/lib/events/fixtures'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

jest.mock('@/lib/events/data', () => {
  const actual = jest.requireActual('@/lib/events/data')

  return {
    ...actual,
    getTotalCount: jest.fn().mockResolvedValue(2)
  }
})

import { sql } from '@/lib/db'
import * as Events from '@/lib/events/data'

const mockSql = jest.mocked(sql)

describe('fetchEventsRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted and categorized events', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 2 }])
      .mockResolvedValueOnce([eventFixtureUpcoming, eventFixturePast])

    const result = await Events.fetchEventsRaw(
      false,
      'project-1',
      undefined,
      'test'
    )

    expect(result).toEqual({
      res: {
        upcomingEvents: [eventFixtureUpcoming],
        pastEvents: [eventFixturePast]
      },
      nextCursor: null,
      totalCount: 2
    })
  })

  it('searches by venue country on both count and page queries', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([eventFixturePast])

    await Events.fetchEventsRaw(false, undefined, undefined, 'Japan')

    for (const call of mockSql.mock.calls.slice(0, 2)) {
      expect((call[0] as unknown as string[]).join('?')).toContain(
        "OR COALESCE(v.country, '') ILIKE ?"
      )
      expect(call).toContain('%Japan%')
    }
  })

  it('searches by venue address on both count and page queries', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([eventFixturePast])

    await Events.fetchEventsRaw(
      false,
      undefined,
      undefined,
      'Broadway'
    )

    for (const call of mockSql.mock.calls.slice(0, 2)) {
      expect((call[0] as unknown as string[]).join('?')).toContain(
        "OR COALESCE(v.address, '') ILIKE ?"
      )
      expect(call).toContain('%Broadway%')
    }
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 2 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(Events.fetchEventsRaw()).rejects.toThrow(
      'Failed to fetch events.'
    )
  })
})

describe('fetchEventById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted event when found', async () => {
    mockSql.mockResolvedValue([eventFixturePast])

    const result = await Events.fetchEventById(eventFixturePast.id)

    expect(result).toEqual(eventFixturePast)
  })

  it('derives cover-image URLs for nested embed codes', async () => {
    mockSql.mockResolvedValue([
      {
        ...eventFixturePast,
        embedCodes: [embedCodeFixture]
      }
    ])

    const result = await Events.fetchEventById(eventFixturePast.id)

    expect(result?.embedCodes?.[0].coverImageUrl).toContain(
      embedCodeFixture.coverImageId
    )
  })

  it.each([
    ['images', 'image_ids', 'i'],
    ['embed codes', 'embed_code_ids', 'ec']
  ])('orders %s by their position in %s', async (_, ids, alias) => {
    mockSql.mockResolvedValue([eventFixturePast])

    await Events.fetchEventById(eventFixturePast.id)

    const [strings] = mockSql.mock.calls[0]
    expect((strings as unknown as string[]).join('?')).toContain(
      `ORDER BY array_position(e.${ids}, ${alias}.id)`
    )
  })

  it('returns undefined when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Events.fetchEventById('missing')

    expect(result).toBeUndefined()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Events.fetchEventById(eventFixturePast.id)
    ).rejects.toThrow(
      `Failed to fetch event: ${eventFixturePast.id}.`
    )
  })
})
