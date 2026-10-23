/** @jest-environment node */

jest.mock('@/lib/releases/data', () => ({ fetchReleases: jest.fn() }))

import { GET } from '@/app/api/releases/route'
import { fetchReleases } from '@/lib/releases/data'
import { apiRequest, mockSession } from '@/test/helpers'

const mockFetch = jest.mocked(fetchReleases)
const page = { releases: [], nextCursor: undefined, totalCount: 0 }

describe('GET /api/releases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(page as never)
  })

  it('passes isAuthed, projectId, cursor and query in order', async () => {
    await GET(
      apiRequest('/api/releases', {
        cursor: 'c1',
        query: 'q',
        projectId: 'p1'
      })
    )

    expect(mockFetch).toHaveBeenCalledWith(true, 'p1', 'c1', 'q')
  })

  it('passes missing params as undefined', async () => {
    await GET(apiRequest('/api/releases'))

    expect(mockFetch).toHaveBeenCalledWith(
      true,
      undefined,
      undefined,
      undefined
    )
  })

  it('passes empty params as undefined', async () => {
    await GET(
      apiRequest('/api/releases', {
        cursor: '',
        query: '',
        projectId: ''
      })
    )

    expect(mockFetch).toHaveBeenCalledWith(
      true,
      undefined,
      undefined,
      undefined
    )
  })

  it('passes isAuthed: false without a session', async () => {
    mockSession(false)
    await GET(apiRequest('/api/releases'))

    expect(mockFetch).toHaveBeenCalledWith(
      false,
      undefined,
      undefined,
      undefined
    )
  })

  it('returns the page with a private, no-store header', async () => {
    const res = await GET(apiRequest('/api/releases'))

    expect(await res.json()).toEqual({ releases: [], totalCount: 0 })
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(
      GET(apiRequest('/api/releases'))
    ).rejects.toMatchObject({
      message: 'Failed to fetch releases.',
      cause
    })
  })
})
