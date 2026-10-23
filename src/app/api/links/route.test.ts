/** @jest-environment node */

jest.mock('@/lib/links/data', () => ({ fetchLinks: jest.fn() }))

import { GET } from '@/app/api/links/route'
import { auth } from '@/auth'
import { fetchLinks } from '@/lib/links/data'
import { apiRequest } from '@/test/helpers'

const mockFetch = jest.mocked(fetchLinks)
const page = { links: [], nextCursor: undefined, totalCount: 0 }

describe('GET /api/links', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(page as never)
  })

  it.each([
    [{ cursor: 'c1', query: 'q' }, ['c1', 'q', undefined]],
    [{}, [undefined, undefined, undefined]],
    [{ cursor: '', query: '' }, [undefined, undefined, undefined]]
  ])('passes params %p as %p', async (params, args) => {
    await GET(apiRequest('/api/links', params))

    expect(mockFetch).toHaveBeenCalledWith(...args)
  })

  it('returns the page without a private header', async () => {
    const res = await GET(apiRequest('/api/links'))

    expect(await res.json()).toEqual({ links: [], totalCount: 0 })
    expect(res.headers.get('Cache-Control')).not.toBe(
      'private, no-store'
    )
  })

  it('reads no session', async () => {
    await GET(apiRequest('/api/links'))

    expect(auth).not.toHaveBeenCalled()
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(GET(apiRequest('/api/links'))).rejects.toMatchObject(
      {
        message: 'Failed to fetch links.',
        cause
      }
    )
  })

  it.each([
    ['true', true],
    ['false', false]
  ])('passes isPress=%s as %p', async (isPress, expected) => {
    await GET(apiRequest('/api/links', { isPress }))

    expect(mockFetch.mock.calls[0]?.[2]).toBe(expected)
  })

  // Documents current behavior: anything but 'true' filters to non-press
  it.each(['1', 'TRUE', ''])(
    'passes any other isPress (%p) as false',
    async (isPress) => {
      await GET(apiRequest('/api/links', { isPress }))

      expect(mockFetch.mock.calls[0]?.[2]).toBe(false)
    }
  )
})
