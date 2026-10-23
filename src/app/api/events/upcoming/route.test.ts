/** @jest-environment node */

jest.mock('@/lib/events/cached', () => ({
  fetchCachedUpcomingEvents: jest.fn()
}))

import { GET } from '@/app/api/events/upcoming/route'
import { fetchCachedUpcomingEvents } from '@/lib/events/cached'
import { mockSession } from '@/test/helpers'

const mockFetch = jest.mocked(fetchCachedUpcomingEvents)
const events = [{ id: 'event-1' }]

describe('GET /api/events/upcoming', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(events as never)
  })

  it.each([true, false])('passes isAuthed: %s', async (isAuthed) => {
    mockSession(isAuthed)
    await GET()

    expect(mockFetch).toHaveBeenCalledWith(isAuthed)
  })

  it('returns the events with a private, no-store header', async () => {
    const res = await GET()

    expect(await res.json()).toEqual(events)
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(GET()).rejects.toMatchObject({
      message: 'Failed to fetch upcoming events.',
      cause
    })
  })
})
