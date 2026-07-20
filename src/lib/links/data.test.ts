import { linkFixture } from '@/lib/links/fixtures'

jest.mock('@/lib/links/cached', () => ({
  fetchCachedLinksFirstPage: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import { fetchCachedLinksFirstPage } from '@/lib/links/cached'
import * as Links from '@/lib/links/data'

const mockSql = jest.mocked(sql)
const mockCached = jest.mocked(fetchCachedLinksFirstPage)

const dashboardLinkRow = {
  ...linkFixture,
  eventSlugs: [],
  projectSlugs: [],
  releaseSlugs: []
}

describe('fetchLinks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cached first page when no cursor and no query', async () => {
    mockCached.mockResolvedValue({
      res: [dashboardLinkRow],
      nextCursor: 'next',
      totalCount: 1
    })

    const result = await Links.fetchLinks()

    expect(mockCached).toHaveBeenCalled()
    expect(result).toEqual({
      res: [dashboardLinkRow],
      nextCursor: 'next',
      totalCount: 1
    })
  })

  it('falls back to raw fetch when cursor is provided', async () => {
    mockSql.mockResolvedValue([])

    const result = await Links.fetchLinks('cursor')

    expect(result).toBeDefined()
  })
})

describe('fetchLinksRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted links', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardLinkRow])

    const result = await Links.fetchLinksRaw(undefined, 'test')

    expect(result).toEqual({
      res: [dashboardLinkRow],
      nextCursor: null,
      totalCount: 1
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 1 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(Links.fetchLinksRaw()).rejects.toThrow(
      'Failed to fetch links.'
    )
  })
})

describe('fetchLinksByIds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted links', async () => {
    mockSql.mockResolvedValue([linkFixture])

    const result = await Links.fetchLinksByIds([linkFixture.id])

    expect(result).toEqual([linkFixture])
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Links.fetchLinksByIds([linkFixture.id])
    ).rejects.toThrow('Failed to fetch links.')
  })
})

describe('fetchLinkByUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted link when found', async () => {
    mockSql.mockResolvedValue([linkFixture])

    const result = await Links.fetchLinkByUrl(linkFixture)

    expect(result).toEqual({
      res: linkFixture,
      fieldName: 'url'
    })
  })

  it('returns null when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Links.fetchLinkByUrl(linkFixture)

    expect(result).toBeNull()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(Links.fetchLinkByUrl(linkFixture)).rejects.toThrow(
      'Failed to fetch link.'
    )
  })
})
