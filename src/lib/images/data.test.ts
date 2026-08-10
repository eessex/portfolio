import {
  createImageFixture,
  imageFixture
} from '@/lib/images/fixtures'

jest.mock('@/lib/images/cached', () => ({
  fetchCachedImagesFirstPage: jest.fn(),
  fetchCachedPressImagesFirstPage: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import {
  fetchCachedImagesFirstPage,
  fetchCachedPressImagesFirstPage
} from '@/lib/images/cached'
import {
  checkIfImageExists,
  fetchImageById,
  fetchImageByUrl,
  fetchImages,
  fetchImagesByIds,
  fetchImagesRaw,
  fetchProjectPressImages
} from '@/lib/images/data'

const mockSql = jest.mocked(sql)
const mockCached = jest.mocked(fetchCachedImagesFirstPage)
const mockCachedPress = jest.mocked(fetchCachedPressImagesFirstPage)

const dashboardImageRow = {
  ...imageFixture,
  eventSlugs: [],
  projectSlugs: [],
  releaseSlugs: []
}

describe('fetchImages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cached first page when no cursor and no query', async () => {
    mockCached.mockResolvedValue({
      res: [dashboardImageRow],
      nextCursor: 'next',
      totalCount: 1
    })

    const result = await fetchImages()

    expect(mockCached).toHaveBeenCalled()
    expect(result).toEqual({
      res: [dashboardImageRow],
      nextCursor: 'next',
      totalCount: 1
    })
  })

  it('falls back to raw fetch when cursor is provided', async () => {
    mockSql.mockResolvedValue([])

    const result = await fetchImages('cursor')

    expect(result).toBeDefined()
  })

  it('returns cached press first page when type is press and no cursor/query', async () => {
    mockCachedPress.mockResolvedValue({
      res: [dashboardImageRow],
      nextCursor: null,
      totalCount: 1
    })

    const result = await fetchImages(undefined, undefined, 'press')

    expect(mockCachedPress).toHaveBeenCalled()
    expect(mockCached).not.toHaveBeenCalled()
    expect(result).toEqual({
      res: [dashboardImageRow],
      nextCursor: null,
      totalCount: 1
    })
  })

  it('falls back to raw fetch for a non-press type with no cursor/query', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([dashboardImageRow])

    await fetchImages(undefined, undefined, 'documentation')

    expect(mockCached).not.toHaveBeenCalled()
    expect(mockCachedPress).not.toHaveBeenCalled()
    expect(mockSql).toHaveBeenCalled()
  })
})

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

describe('#fetchProjectPressImages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted images', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await fetchProjectPressImages('project-id')

    expect(result).toEqual([imageFixture])
    expect(mockSql.mock.calls[0]).toContain('project-id')
  })

  it('passes isDefault through to the query so unowned images are included', async () => {
    mockSql.mockResolvedValue([imageFixture])

    await fetchProjectPressImages('project-id', true)

    expect(mockSql.mock.calls[0]).toContain(true)
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      fetchProjectPressImages('project-id')
    ).rejects.toThrow('Failed to fetch project press images.')
  })
})

describe('checkIfImageExists', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the image when a match is found', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await checkIfImageExists('some-filename.jpg')

    expect(result).toEqual(imageFixture)
  })

  it('returns false when the match has the same id', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await checkIfImageExists(
      'some-filename.jpg',
      imageFixture.id
    )

    expect(result).toBe(false)
  })

  it('returns false when no match is found', async () => {
    mockSql.mockResolvedValue([])

    const result = await checkIfImageExists('missing-filename.jpg')

    expect(result).toBe(false)
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      checkIfImageExists('some-filename.jpg')
    ).rejects.toThrow('Failed to check if image exists.')
  })
})
