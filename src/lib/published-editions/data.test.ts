import { publishedEditionFixtureAlpha } from '@/lib/published-editions/fixtures'

jest.mock('@/lib/published-editions/cached', () => ({
  fetchCachedPublishedEditionsFirstPage: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import { fetchCachedPublishedEditionsFirstPage } from '@/lib/published-editions/cached'
import * as PublishedEditions from '@/lib/published-editions/data'

const mockSql = jest.mocked(sql)
const mockCached = jest.mocked(fetchCachedPublishedEditionsFirstPage)

const dashboardPublishedEditionRow = {
  ...publishedEditionFixtureAlpha,
  release: {
    id: publishedEditionFixtureAlpha.releaseId,
    title: 'Existing Release'
  },
  releaseSlugs: []
}

describe('fetchPublishedEditions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cached first page when no cursor and no query', async () => {
    mockCached.mockResolvedValue({
      res: [dashboardPublishedEditionRow],
      nextCursor: 'next',
      totalCount: 1
    })

    const result = await PublishedEditions.fetchPublishedEditions()

    expect(mockCached).toHaveBeenCalled()
    expect(result).toEqual({
      res: [dashboardPublishedEditionRow],
      nextCursor: 'next',
      totalCount: 1
    })
  })

  it('falls back to raw fetch when cursor is provided', async () => {
    mockSql.mockResolvedValue([])

    const result =
      await PublishedEditions.fetchPublishedEditions('cursor')

    expect(result).toBeDefined()
  })
})

describe('fetchPublishedEditionsRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted published editions', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardPublishedEditionRow])

    const result = await PublishedEditions.fetchPublishedEditionsRaw(
      undefined,
      'test'
    )

    expect(result).toEqual({
      res: [dashboardPublishedEditionRow],
      nextCursor: null,
      totalCount: 1
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 1 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(
      PublishedEditions.fetchPublishedEditionsRaw()
    ).rejects.toThrow('Failed to fetch published editions.')
  })
})

describe('fetchPublishedEditionById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted published edition when found', async () => {
    mockSql.mockResolvedValue([dashboardPublishedEditionRow])

    const result = await PublishedEditions.fetchPublishedEditionById(
      publishedEditionFixtureAlpha.id
    )

    expect(result).toEqual(dashboardPublishedEditionRow)
  })

  it('returns null when not found', async () => {
    mockSql.mockResolvedValue([])

    const result =
      await PublishedEditions.fetchPublishedEditionById('missing')

    expect(result).toBeNull()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      PublishedEditions.fetchPublishedEditionById(
        publishedEditionFixtureAlpha.id
      )
    ).rejects.toThrow('Failed to fetch published edition.')
  })
})
