import { embedCodeFixture } from '@/lib/embed-codes/fixtures'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import { withCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import * as EmbedCodes from '@/lib/embed-codes/data'

const mockSql = jest.mocked(sql)

const dashboardEmbedCodeRow = withCoverImageUrls({
  ...embedCodeFixture,
  eventSlugs: [],
  projectSlugs: [],
  releaseSlugs: []
})

describe('fetchEmbedCodesRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted embed codes', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardEmbedCodeRow])

    const result = await EmbedCodes.fetchEmbedCodesRaw(
      undefined,
      'test'
    )

    expect(result).toEqual({
      res: [dashboardEmbedCodeRow],
      nextCursor: null,
      totalCount: 1
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 1 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(EmbedCodes.fetchEmbedCodesRaw()).rejects.toThrow(
      'Failed to fetch embed codes.'
    )
  })

  it('lists every project that uses it as project_slugs, not just its owner', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardEmbedCodeRow])

    await EmbedCodes.fetchEmbedCodesRaw()

    const text = mockSql.mock.calls[1]![0].join('?')
    expect(text).toContain(
      'p.embed_code_ids @> ARRAY[embed_codes.id]'
    )
    expect(text).not.toContain('embed_codes.project_id')
  })
})

describe('fetchEmbedCodesByIds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted embed codes', async () => {
    mockSql.mockResolvedValue([embedCodeFixture])

    const result = await EmbedCodes.fetchEmbedCodesByIds([
      embedCodeFixture.id
    ])

    expect(result).toEqual([withCoverImageUrls(embedCodeFixture)])
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      EmbedCodes.fetchEmbedCodesByIds([embedCodeFixture.id])
    ).rejects.toThrow('Failed to fetch embed codes.')
  })
})
