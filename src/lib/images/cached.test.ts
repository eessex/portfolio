import { cacheTag } from 'next/cache'

jest.mock('@/lib/images/data', () => ({
  fetchImagesRaw: jest.fn()
}))

import { fetchImages } from '@/lib/images/cached'
import { fetchImagesRaw } from '@/lib/images/data'

describe('fetchImages', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serves the first page from the cache', async () => {
    await fetchImages()

    expect(cacheTag).toHaveBeenCalledWith('images')
    expect(fetchImagesRaw).toHaveBeenCalledWith()
  })

  it('serves the press first page from the cache', async () => {
    await fetchImages(undefined, undefined, 'press')

    expect(cacheTag).toHaveBeenCalledWith('images')
    expect(fetchImagesRaw).toHaveBeenCalledWith(
      undefined,
      undefined,
      'press'
    )
  })

  it('fetches a non-press type uncached', async () => {
    await fetchImages(undefined, undefined, 'documentation')

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchImagesRaw).toHaveBeenCalledWith(
      undefined,
      undefined,
      'documentation'
    )
  })

  it('fetches later pages and searches uncached', async () => {
    await fetchImages('cursor')
    await fetchImages(undefined, 'query', 'press')

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchImagesRaw).toHaveBeenCalledWith(
      'cursor',
      undefined,
      undefined
    )
    expect(fetchImagesRaw).toHaveBeenCalledWith(
      undefined,
      'query',
      'press'
    )
  })
})
