import {
  createImageFixture,
  imageFixture
} from '@/lib/images/fixtures'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import {
  fetchImageById,
  fetchImageByUrl,
  fetchImagesByIds,
  fetchImagesRaw
} from '@/lib/images/data'

const mockSql = jest.mocked(sql)

const dashboardImageRow = {
  ...imageFixture,
  eventSlugs: [],
  projectSlugs: [],
  releaseSlugs: []
}

describe('fetchImagesRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted images', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardImageRow])

    const result = await fetchImagesRaw(undefined, 'test')

    expect(result).toEqual({
      res: [dashboardImageRow],
      nextCursor: null,
      totalCount: 1
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 1 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(fetchImagesRaw()).rejects.toThrow(
      'Failed to fetch images.'
    )
  })

  it('lists every project that uses it as project_slugs, not just its owner', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardImageRow])

    await fetchImagesRaw()

    const text = mockSql.mock.calls[1]![0].join('?')
    expect(text).toContain('p.image_ids @> ARRAY[images.id]')
    expect(text).toContain('p.cover_image_id = images.id')
    expect(text).not.toContain('images.project_id')
  })

  it('searches by type on both count and page queries', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardImageRow])

    await fetchImagesRaw(undefined, 'flyer')

    expect(mockSql.mock.calls[0]![0].join('?')).toContain(
      'OR type ILIKE ?'
    )
    expect(mockSql.mock.calls[1]![0].join('?')).toContain(
      'OR images.type ILIKE ?'
    )
    expect(mockSql.mock.calls[0]).toContain('%flyer%')
  })

  it('searches by alt text on both count and page queries', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardImageRow])

    await fetchImagesRaw(undefined, 'sunset')

    for (const call of mockSql.mock.calls.slice(0, 2)) {
      expect(call[0].join('?')).toContain('OR alt ILIKE ?')
      expect(call).toContain('%sunset%')
    }
  })

  it('restricts to a type when one is set', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardImageRow])

    await fetchImagesRaw(undefined, undefined, 'press')

    // the `type` filter is bound 'press' on both count and page queries
    expect(mockSql.mock.calls[0]).toContain('press')
    expect(mockSql.mock.calls[1]).toContain('press')
  })

  it('does not restrict by type by default', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardImageRow])

    await fetchImagesRaw()

    expect(mockSql.mock.calls[0]).toContain(null)
    expect(mockSql.mock.calls[1]).toContain(null)
  })
})

describe('#fetchImageById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted image when found', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await fetchImageById(imageFixture.id)

    expect(result).toEqual(imageFixture)
  })

  it('returns undefined when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await fetchImageById('missing')

    expect(result).toBeUndefined()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(fetchImageById(imageFixture.id)).rejects.toThrow(
      `Failed to fetch image ${imageFixture.id}.`
    )
  })
})

describe('#fetchImagesByIds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted images', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await fetchImagesByIds([imageFixture.id])

    expect(result).toEqual([imageFixture])
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(fetchImagesByIds([imageFixture.id])).rejects.toThrow(
      'Failed to fetch images.'
    )
  })
})

describe('fetchImageByUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted image when found', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await fetchImageByUrl(createImageFixture)

    expect(result).toEqual({
      res: imageFixture,
      fieldName: 'url'
    })
  })

  it('returns null when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await fetchImageByUrl(createImageFixture)

    expect(result).toBeNull()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(fetchImageByUrl(createImageFixture)).rejects.toThrow(
      'Failed to fetch image by URL.'
    )
  })
})
