/** @jest-environment node */

jest.mock('@/lib/venues/data', () => ({ fetchVenues: jest.fn() }))

import { GET } from '@/app/api/venues/route'
import { auth } from '@/auth'
import { fetchVenues } from '@/lib/venues/data'
import { apiRequest } from '@/test/helpers'

const mockFetch = jest.mocked(fetchVenues)
const page = { venues: [], nextCursor: undefined, totalCount: 0 }

describe('GET /api/venues', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(page as never)
  })

  it.each([
    [{ cursor: 'c1', query: 'q' }, ['c1', 'q']],
    [{}, [undefined, undefined]],
    [{ cursor: '', query: '' }, [undefined, undefined]]
  ])('passes params %p as %p', async (params, args) => {
    await GET(apiRequest('/api/venues', params))

    expect(mockFetch).toHaveBeenCalledWith(...args)
  })

  it('returns the page without a private header', async () => {
    const res = await GET(apiRequest('/api/venues'))

    expect(await res.json()).toEqual({ venues: [], totalCount: 0 })
    expect(res.headers.get('Cache-Control')).not.toBe(
      'private, no-store'
    )
  })

  it('reads no session', async () => {
    await GET(apiRequest('/api/venues'))

    expect(auth).not.toHaveBeenCalled()
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(
      GET(apiRequest('/api/venues'))
    ).rejects.toMatchObject({
      message: 'Failed to fetch venues.',
      cause
    })
  })
})
