import { cacheTag } from 'next/cache'

jest.mock('@/lib/embed-codes/data', () => ({
  fetchEmbedCodesRaw: jest.fn()
}))

import { fetchEmbedCodes } from '@/lib/embed-codes/cached'
import { fetchEmbedCodesRaw } from '@/lib/embed-codes/data'

describe('fetchEmbedCodes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serves the first page from the cache', async () => {
    await fetchEmbedCodes()

    expect(cacheTag).toHaveBeenCalledWith('embed-codes')
    expect(fetchEmbedCodesRaw).toHaveBeenCalledWith()
  })

  it('fetches later pages and searches uncached', async () => {
    await fetchEmbedCodes('cursor')
    await fetchEmbedCodes(undefined, 'query')

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchEmbedCodesRaw).toHaveBeenCalledWith(
      'cursor',
      undefined
    )
    expect(fetchEmbedCodesRaw).toHaveBeenCalledWith(
      undefined,
      'query'
    )
  })
})
