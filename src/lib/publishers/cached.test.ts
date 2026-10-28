import { cacheTag } from 'next/cache'

jest.mock('@/lib/publishers/data', () => ({
  fetchPublishersRaw: jest.fn()
}))

import { fetchPublishers } from '@/lib/publishers/cached'
import { fetchPublishersRaw } from '@/lib/publishers/data'

describe('fetchPublishers', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serves the first page from the cache', async () => {
    await fetchPublishers()

    expect(cacheTag).toHaveBeenCalledWith('publishers')
    expect(fetchPublishersRaw).toHaveBeenCalledWith()
  })

  it('fetches later pages and searches uncached', async () => {
    await fetchPublishers('cursor')
    await fetchPublishers(undefined, 'query')

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchPublishersRaw).toHaveBeenCalledWith(
      'cursor',
      undefined
    )
    expect(fetchPublishersRaw).toHaveBeenCalledWith(
      undefined,
      'query'
    )
  })
})
