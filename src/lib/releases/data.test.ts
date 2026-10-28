import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import {
  releaseFixtureAlbum,
  releaseFixtureSingle
} from '@/lib/releases/fixtures'

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

import { sql } from '@/lib/db'
import * as Releases from '@/lib/releases/data'

const mockSql = jest.mocked(sql)

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

  it('matches a search on edition format in both queries', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([releaseFixtureAlbum])

    const result = await Releases.fetchReleasesRaw(
      false,
      undefined,
      undefined,
      'Cassette'
    )

    expect(result.totalCount).toBe(1)
    for (const [strings, ...params] of mockSql.mock.calls) {
      const text = (strings as unknown as string[]).join('?')
      expect(text).toContain('OR pe.format ILIKE ?')
      expect(params).toContain('%Cassette%')
    }
    expect(mockSql).toHaveBeenCalledTimes(2)
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

  it('derives cover-image URLs for nested embed codes', async () => {
    mockSql.mockResolvedValue([
      {
        ...releaseFixtureAlbum,
        embedCodes: [embedCodeFixture]
      }
    ])

    const result = await Releases.fetchReleaseById(
      releaseFixtureAlbum.id
    )

    expect(result?.embedCodes?.[0].coverImageUrl).toContain(
      embedCodeFixture.coverImageId
    )
    expect(result?.embedCodes?.[0].coverImageThumbnailUrl).toContain(
      embedCodeFixture.coverImageId
    )
  })

  it.each([
    ['images', 'image_ids', 'i'],
    ['embed codes', 'embed_code_ids', 'ec']
  ])('orders %s by their position in %s', async (_, ids, alias) => {
    mockSql.mockResolvedValue([releaseFixtureAlbum])

    await Releases.fetchReleaseById(releaseFixtureAlbum.id)

    const [strings] = mockSql.mock.calls[0]
    expect((strings as unknown as string[]).join('?')).toContain(
      `ORDER BY array_position(r.${ids}, ${alias}.id)`
    )
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
