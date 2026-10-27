/** @jest-environment node */

jest.mock('@/lib/embed-codes/cached', () => ({
  fetchEmbedCodes: jest.fn()
}))

import { GET } from '@/app/api/embed_codes/route'
import { auth } from '@/auth'
import { fetchEmbedCodes } from '@/lib/embed-codes/cached'
import { apiRequest } from '@/test/helpers'

const mockFetch = jest.mocked(fetchEmbedCodes)
const page = { embed_codes: [], nextCursor: undefined, totalCount: 0 }

describe('GET /api/embed_codes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(page as never)
  })

  it.each([
    [{ cursor: 'c1', query: 'q' }, ['c1', 'q']],
    [{}, [undefined, undefined]],
    [{ cursor: '', query: '' }, [undefined, undefined]]
  ])('passes params %p as %p', async (params, args) => {
    await GET(apiRequest('/api/embed_codes', params))

    expect(mockFetch).toHaveBeenCalledWith(...args)
  })

  it('returns the page without a private header', async () => {
    const res = await GET(apiRequest('/api/embed_codes'))

    expect(await res.json()).toEqual({
      embed_codes: [],
      totalCount: 0
    })
    expect(res.headers.get('Cache-Control')).not.toBe(
      'private, no-store'
    )
  })

  it('reads no session', async () => {
    await GET(apiRequest('/api/embed_codes'))

    expect(auth).not.toHaveBeenCalled()
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(
      GET(apiRequest('/api/embed_codes'))
    ).rejects.toMatchObject({
      message: 'Failed to fetch embed codes.',
      cause
    })
  })
})
