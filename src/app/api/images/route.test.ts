/** @jest-environment node */

jest.mock('@/lib/images/cached', () => ({ fetchImages: jest.fn() }))

import { GET } from '@/app/api/images/route'
import { auth } from '@/auth'
import { fetchImages } from '@/lib/images/cached'
import { apiRequest } from '@/test/helpers'

const mockFetch = jest.mocked(fetchImages)
const page = { images: [], nextCursor: undefined, totalCount: 0 }
const noSvgFilter = { isSvgExcluded: false }

describe('GET /api/images', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(page as never)
  })

  it.each([
    [
      { cursor: 'c1', query: 'q' },
      ['c1', 'q', undefined, noSvgFilter]
    ],
    [{}, [undefined, undefined, undefined, noSvgFilter]],
    [
      { cursor: '', query: '' },
      [undefined, undefined, undefined, noSvgFilter]
    ]
  ])('passes params %p as %p', async (params, args) => {
    await GET(apiRequest('/api/images', params))

    expect(mockFetch).toHaveBeenCalledWith(...args)
  })

  it('returns the page without a private header', async () => {
    const res = await GET(apiRequest('/api/images'))

    expect(await res.json()).toEqual({ images: [], totalCount: 0 })
    expect(res.headers.get('Cache-Control')).not.toBe(
      'private, no-store'
    )
  })

  it('reads no session', async () => {
    await GET(apiRequest('/api/images'))

    expect(auth).not.toHaveBeenCalled()
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(
      GET(apiRequest('/api/images'))
    ).rejects.toMatchObject({
      message: 'Failed to fetch images.',
      cause
    })
  })

  it('passes type as the third argument', async () => {
    await GET(apiRequest('/api/images', { type: 'press' }))

    expect(mockFetch).toHaveBeenCalledWith(
      undefined,
      undefined,
      'press',
      noSvgFilter
    )
  })

  it('passes an empty type as undefined', async () => {
    await GET(apiRequest('/api/images', { type: '' }))

    expect(mockFetch).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      noSvgFilter
    )
  })

  it('passes isSvgExcluded=true through', async () => {
    await GET(apiRequest('/api/images', { isSvgExcluded: 'true' }))

    expect(mockFetch).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      { isSvgExcluded: true }
    )
  })
})
