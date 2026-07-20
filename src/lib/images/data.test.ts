import {
  createImageFixture,
  imageFixture
} from '@/lib/images/fixtures'

jest.mock('@/lib/images/cached', () => ({
  fetchCachedImagesFirstPage: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import { fetchCachedImagesFirstPage } from '@/lib/images/cached'
import * as Images from '@/lib/images/data'

const mockSql = jest.mocked(sql)
const mockCached = jest.mocked(fetchCachedImagesFirstPage)

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

    const result = await Images.fetchImages()

    expect(mockCached).toHaveBeenCalled()
    expect(result).toEqual({
      res: [dashboardImageRow],
      nextCursor: 'next',
      totalCount: 1
    })
  })

  it('falls back to raw fetch when cursor is provided', async () => {
    mockSql.mockResolvedValue([])

    const result = await Images.fetchImages('cursor')

    expect(result).toBeDefined()
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

    const result = await Images.fetchImagesRaw(undefined, 'test')

    expect(result).toEqual({
      res: [dashboardImageRow],
      nextCursor: null,
      totalCount: 1
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 1 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(Images.fetchImagesRaw()).rejects.toThrow(
      'Failed to fetch images.'
    )
  })
})

describe('fetchImageById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted image when found', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await Images.fetchImageById(imageFixture.id)

    expect(result).toEqual(imageFixture)
  })

  it('returns undefined when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Images.fetchImageById('missing')

    expect(result).toBeUndefined()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Images.fetchImageById(imageFixture.id)
    ).rejects.toThrow(`Failed to fetch image ${imageFixture.id}.`)
  })
})

describe('fetchImagesByIds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted images', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await Images.fetchImagesByIds([imageFixture.id])

    expect(result).toEqual([imageFixture])
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Images.fetchImagesByIds([imageFixture.id])
    ).rejects.toThrow('Failed to fetch images.')
  })
})

describe('fetchImageByUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted image when found', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await Images.fetchImageByUrl(createImageFixture)

    expect(result).toEqual({
      res: imageFixture,
      fieldName: 'url'
    })
  })

  it('returns null when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Images.fetchImageByUrl(createImageFixture)

    expect(result).toBeNull()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Images.fetchImageByUrl(createImageFixture)
    ).rejects.toThrow('Failed to fetch image by URL.')
  })
})

describe('checkIfImageExists', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the image when a match is found', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await Images.checkIfImageExists(
      'some-filename.jpg'
    )

    expect(result).toEqual(imageFixture)
  })

  it('returns false when the match has the same id', async () => {
    mockSql.mockResolvedValue([imageFixture])

    const result = await Images.checkIfImageExists(
      'some-filename.jpg',
      imageFixture.id
    )

    expect(result).toBe(false)
  })

  it('returns false when no match is found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Images.checkIfImageExists(
      'missing-filename.jpg'
    )

    expect(result).toBe(false)
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Images.checkIfImageExists('some-filename.jpg')
    ).rejects.toThrow('Failed to check if image exists.')
  })
})
