/** @jest-environment node */

jest.mock('@/lib/publishers/cached', () => ({
  fetchPublishers: jest.fn()
}))

import { GET } from '@/app/api/publishers/route'
import { auth } from '@/auth'
import { fetchPublishers } from '@/lib/publishers/cached'
import { apiRequest } from '@/test/helpers'

const mockFetch = jest.mocked(fetchPublishers)
const page = { publishers: [], nextCursor: undefined, totalCount: 0 }

describe('GET /api/publishers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(page as never)
  })

  it.each([
    [{ cursor: 'c1', query: 'q' }, ['c1', 'q']],
    [{}, [undefined, undefined]],
    [{ cursor: '', query: '' }, [undefined, undefined]]
  ])('passes params %p as %p', async (params, args) => {
    await GET(apiRequest('/api/publishers', params))

    expect(mockFetch).toHaveBeenCalledWith(...args)
  })

  it('returns the page without a private header', async () => {
    const res = await GET(apiRequest('/api/publishers'))

    expect(await res.json()).toEqual({
      publishers: [],
      totalCount: 0
    })
    expect(res.headers.get('Cache-Control')).not.toBe(
      'private, no-store'
    )
  })

  it('reads no session', async () => {
    await GET(apiRequest('/api/publishers'))

    expect(auth).not.toHaveBeenCalled()
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(
      GET(apiRequest('/api/publishers'))
    ).rejects.toMatchObject({
      message: 'Failed to fetch publishers.',
      cause
    })
  })
})
