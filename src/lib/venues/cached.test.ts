import { cacheTag } from 'next/cache'

jest.mock('@/lib/venues/data', () => ({
  fetchVenuesRaw: jest.fn()
}))

import { fetchVenues } from '@/lib/venues/cached'
import { fetchVenuesRaw } from '@/lib/venues/data'

describe('fetchVenues', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serves the first page from the cache', async () => {
    await fetchVenues()

    expect(cacheTag).toHaveBeenCalledWith('venues')
    expect(fetchVenuesRaw).toHaveBeenCalledWith()
  })

  it('fetches later pages and searches uncached', async () => {
    await fetchVenues('cursor')
    await fetchVenues(undefined, 'query')

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchVenuesRaw).toHaveBeenCalledWith('cursor', undefined)
    expect(fetchVenuesRaw).toHaveBeenCalledWith(undefined, 'query')
  })
})
