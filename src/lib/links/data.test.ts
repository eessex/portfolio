import { linkFixture } from '@/lib/links/fixtures'

jest.mock('@/lib/links/cached', () => ({
  fetchCachedLinksFirstPage: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import { fetchCachedLinksFirstPage } from '@/lib/links/cached'
import {
  fetchLinkByUrl,
  fetchLinks,
  fetchLinksByIds,
  fetchLinksRaw
} from '@/lib/links/data'

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

    const result = await fetchLinks()

    expect(mockCached).toHaveBeenCalled()
    expect(result).toEqual({
      res: [dashboardLinkRow],
      nextCursor: 'next',
      totalCount: 1
    })
  })

  it('falls back to raw fetch when cursor is provided', async () => {
    mockSql.mockResolvedValue([])

    const result = await fetchLinks('cursor')

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

    const result = await fetchLinksRaw(undefined, 'test')

    expect(result).toEqual({
      res: [dashboardLinkRow],
      nextCursor: null,
      totalCount: 1
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 1 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(fetchLinksRaw()).rejects.toThrow(
      'Failed to fetch links.'
    )
  })

  it('lists every project that uses it as project_slugs, not just its owner', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardLinkRow])

    await fetchLinksRaw()

    const text = mockSql.mock.calls[1]![0].join('?')
    expect(text).toContain('p.link_ids @> ARRAY[links.id]')
    expect(text).not.toContain('links.project_id')
  })
})

describe('fetchLinksByIds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted links', async () => {
    mockSql.mockResolvedValue([linkFixture])

    const result = await fetchLinksByIds([linkFixture.id])

    expect(result).toEqual([linkFixture])
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(fetchLinksByIds([linkFixture.id])).rejects.toThrow(
      'Failed to fetch links.'
    )
  })
})

describe('fetchLinkByUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the formatted link when found', async () => {
    mockSql.mockResolvedValue([linkFixture])

    const result = await fetchLinkByUrl(linkFixture.url, 'social')

    expect(result).toEqual(linkFixture)
  })

  it('returns undefined when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await fetchLinkByUrl(linkFixture.url, 'social')

    expect(result).toBeUndefined()
  })

  it('matches the trimmed url and the given type only', async () => {
    mockSql.mockResolvedValue([])

    await fetchLinkByUrl(`  ${linkFixture.url} `, 'social')

    const [strings, ...params] = mockSql.mock.calls[0]!
    expect(params[0]).toBe(linkFixture.url)
    expect(params[1]).toBe('social')
    expect((strings as TemplateStringsArray).join('?')).toMatch(
      /WHERE url = \?\s+AND type = \?/
    )
  })

  it('matches the title case-insensitively when given', async () => {
    mockSql.mockResolvedValue([])

    await fetchLinkByUrl(linkFixture.url, 'social', 'Bandcamp')

    const [strings, ...params] = mockSql.mock.calls[0]!
    expect(params.slice(2)).toEqual(['Bandcamp', 'Bandcamp'])
    expect((strings as TemplateStringsArray).join('?')).toMatch(
      /lower\(title\) = lower\(\?\)/
    )
  })

  it('ignores the title when not given', async () => {
    mockSql.mockResolvedValue([])

    await fetchLinkByUrl(linkFixture.url, 'social')

    expect(mockSql.mock.calls[0]!.slice(3)).toEqual([null, null])
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      fetchLinkByUrl(linkFixture.url, 'social')
    ).rejects.toThrow('Failed to fetch link.')
  })
})
