/** @jest-environment node */

jest.mock('@/lib/events/cached', () => ({ fetchEvents: jest.fn() }))

import { GET } from '@/app/api/events/route'
import { fetchEvents } from '@/lib/events/cached'
import { apiRequest, mockSession } from '@/test/helpers'

const mockFetch = jest.mocked(fetchEvents)
const page = { events: [], nextCursor: undefined, totalCount: 0 }

describe('GET /api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(page as never)
  })

  it('passes isAuthed, projectId, cursor and query in order', async () => {
    await GET(
      apiRequest('/api/events', {
        cursor: 'c1',
        query: 'q',
        projectId: 'p1'
      })
    )

    expect(mockFetch).toHaveBeenCalledWith(true, 'p1', 'c1', 'q')
  })

  it('passes missing params as undefined', async () => {
    await GET(apiRequest('/api/events'))

    expect(mockFetch).toHaveBeenCalledWith(
      true,
      undefined,
      undefined,
      undefined
    )
  })

  it('passes empty params as undefined', async () => {
    await GET(
      apiRequest('/api/events', {
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
    await GET(apiRequest('/api/events'))

    expect(mockFetch).toHaveBeenCalledWith(
      false,
      undefined,
      undefined,
      undefined
    )
  })

  it('returns the page with a private, no-store header', async () => {
    const res = await GET(apiRequest('/api/events'))

    expect(await res.json()).toEqual({ events: [], totalCount: 0 })
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(
      GET(apiRequest('/api/events'))
    ).rejects.toMatchObject({
      message: 'Failed to fetch events.',
      cause
    })
  })
})
