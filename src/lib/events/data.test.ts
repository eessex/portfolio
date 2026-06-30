jest.mock('@/lib/events/cached', () => ({
  fetchCachedEventsFirstPage: jest.fn()
}))

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

jest.mock('@/lib/slug/util', () => {
  const actual = jest.requireActual('@/lib/slug/util')

  return {
    ...actual,
    resolveSlug: jest.fn(() => ({
      id: '1',
      slug: 'event-1',
      isRedirect: true
    })),
    getTableIdentifier: jest.fn(() => ({ mockedTable: 'projects' }))
  }
})

import { sql } from '@/lib/db'
import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import * as Events from '@/lib/events/data'

import { eventFixturePast, eventFixtureUpcoming } from './fixtures'

const mockSql = jest.mocked(sql)
const mockCached = jest.mocked(fetchCachedEventsFirstPage)

describe('fetchEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cached first page when no cursor and no query', async () => {
    mockCached.mockResolvedValue({
      res: {
        upcomingEvents: [eventFixtureUpcoming],
        pastEvents: [eventFixturePast]
      },
      nextCursor: 'next',
      totalCount: 2
    })

    const result = await Events.fetchEvents(false, 'project-1')

    expect(mockCached).toHaveBeenCalledWith(false, 'project-1')
    expect(result).toEqual({
      res: {
        upcomingEvents: [eventFixtureUpcoming],
        pastEvents: [eventFixturePast]
      },
      nextCursor: 'next',
      totalCount: 2
    })
  })

  it('falls back to raw fetch when cursor is provided', async () => {
    mockSql.mockResolvedValue([])

    const result = await Events.fetchEvents(
      false,
      undefined,
      'cursor'
    )

    expect(result).toBeDefined()
  })
})

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

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 2 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(Events.fetchEventsRaw()).rejects.toThrow(
      'Failed to fetch events.'
    )
  })
})

describe('fetchEventBySlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted event when found', async () => {
    mockSql.mockResolvedValue([eventFixturePast])

    const result = await Events.fetchEventBySlug('event-1')

    expect(result).toEqual(eventFixturePast)
  })

  it('returns undefined when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Events.fetchEventBySlug('missing')

    expect(result).toBeUndefined()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(Events.fetchEventBySlug('event-1')).rejects.toThrow(
      'Failed to fetch event: event-1.'
    )
  })
})
