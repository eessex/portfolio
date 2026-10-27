import { cacheTag } from 'next/cache'

jest.mock('@/lib/links/data', () => ({
  fetchLinksRaw: jest.fn()
}))

import { fetchLinks } from '@/lib/links/cached'
import { fetchLinksRaw } from '@/lib/links/data'

describe('fetchLinks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serves the first page from the cache', async () => {
    await fetchLinks(undefined, undefined, true)

    expect(cacheTag).toHaveBeenCalledWith('links')
    expect(fetchLinksRaw).toHaveBeenCalledWith(
      undefined,
      undefined,
      true
    )
  })

  it('fetches later pages and searches uncached', async () => {
    await fetchLinks('cursor')
    await fetchLinks(undefined, 'query', false)

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchLinksRaw).toHaveBeenCalledWith(
      'cursor',
      undefined,
      undefined
    )
    expect(fetchLinksRaw).toHaveBeenCalledWith(
      undefined,
      'query',
      false
    )
  })
})
