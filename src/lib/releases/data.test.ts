jest.mock('@/lib/releases/cached', () => ({
  fetchCachedReleasesFirstPage: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

jest.mock('@/lib/releases/data', () => {
  const actual = jest.requireActual('@/lib/releases/data')

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
      slug: 'release-1',
      isRedirect: true
    })),
    getTableIdentifier: jest.fn(() => ({ mockedTable: 'releases' }))
  }
})

import { sql } from '@/lib/db'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import * as Releases from '@/lib/releases/data'
import {
  releaseFixtureAlbum,
  releaseFixtureSingle
} from '@/lib/releases/fixtures'

const mockSql = jest.mocked(sql)
const mockCached = jest.mocked(fetchCachedReleasesFirstPage)

describe('fetchReleases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cached first page when no cursor and no query', async () => {
    mockCached.mockResolvedValue({
      res: {
        releases: [],
        albums: [releaseFixtureAlbum],
        singlesAndCompilations: [releaseFixtureSingle],
        eps: [],
        soundtracks: [],
        collaborativeReleases: [],
        featuredOn: [],
        everythingElse: []
      },
      nextCursor: 'next',
      totalCount: 2
    })

    const result = await Releases.fetchReleases(false, 'project-1')

    expect(mockCached).toHaveBeenCalledWith(false, 'project-1')
    expect(result).toEqual({
      res: {
        releases: [],
        albums: [releaseFixtureAlbum],
        singlesAndCompilations: [releaseFixtureSingle],
        eps: [],
        soundtracks: [],
        collaborativeReleases: [],
        featuredOn: [],
        everythingElse: []
      },
      nextCursor: 'next',
      totalCount: 2
    })
  })

  it('falls back to raw fetch when cursor is provided', async () => {
    mockSql.mockResolvedValue([])

    const result = await Releases.fetchReleases(
      false,
      undefined,
      'cursor'
    )

    expect(result).toBeDefined()
  })
})

describe('fetchReleasesRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted and categorized releases', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 2 }])
      .mockResolvedValueOnce([
        releaseFixtureAlbum,
        releaseFixtureSingle
      ])

    const result = await Releases.fetchReleasesRaw(
      false,
      'project-1',
      undefined,
      'test'
    )

    expect(result).toEqual({
      res: {
        releases: [],
        albums: [releaseFixtureAlbum],
        singlesAndCompilations: [releaseFixtureSingle],
        eps: [],
        soundtracks: [],
        collaborativeReleases: [],
        featuredOn: [],
        everythingElse: []
      },
      nextCursor: null,
      totalCount: 2
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 2 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(Releases.fetchReleasesRaw()).rejects.toThrow(
      'Failed to fetch releases.'
    )
  })
})

describe('fetchReleaseById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted release when found', async () => {
    mockSql.mockResolvedValue([releaseFixtureAlbum])

    const result = await Releases.fetchReleaseById(
      releaseFixtureAlbum.id
    )

    expect(result).toEqual(releaseFixtureAlbum)
  })

  it('returns undefined when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Releases.fetchReleaseById('missing')

    expect(result).toBeUndefined()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Releases.fetchReleaseById(releaseFixtureAlbum.id)
    ).rejects.toThrow(
      `Failed to fetch release: ${releaseFixtureAlbum.id}.`
    )
  })
})
