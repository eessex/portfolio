import { venueFixtureAlpha } from '@/lib/venues/fixtures'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import * as Venues from '@/lib/venues/data'

const mockSql = jest.mocked(sql)

const dashboardVenueRow = {
  ...venueFixtureAlpha,
  eventSlugs: []
}

describe('fetchVenuesRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted venues', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardVenueRow])

    const result = await Venues.fetchVenuesRaw(undefined, 'test')

    expect(result).toEqual({
      res: [dashboardVenueRow],
      nextCursor: null,
      totalCount: 1
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 1 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(Venues.fetchVenuesRaw()).rejects.toThrow(
      'Failed to fetch venues.'
    )
  })
})

describe('fetchVenueById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted venue when found', async () => {
    mockSql.mockResolvedValue([dashboardVenueRow])

    const result = await Venues.fetchVenueById(venueFixtureAlpha.id)

    expect(result).toEqual(dashboardVenueRow)
  })

  it('returns null when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Venues.fetchVenueById('missing')

    expect(result).toBeNull()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Venues.fetchVenueById(venueFixtureAlpha.id)
    ).rejects.toThrow('Failed to fetch venue.')
  })
})
