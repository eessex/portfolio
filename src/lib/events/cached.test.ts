import { cacheTag } from 'next/cache'

jest.mock('@/lib/events/data', () => ({
  fetchEventById: jest.fn(),
  fetchEventsRaw: jest.fn(),
  fetchUpcomingEventsRaw: jest.fn()
}))

import { fetchCachedEventById } from '@/lib/events/cached'
import { fetchEventById } from '@/lib/events/data'

const mockFetch = jest.mocked(fetchEventById)

describe('fetchCachedEventById', () => {
  beforeEach(() => jest.clearAllMocks())

  it('tags the cache with its project, so project edits invalidate it', async () => {
    mockFetch.mockResolvedValueOnce({
      id: 'event-1',
      projectId: 'project-1'
    } as never)

    await fetchCachedEventById('event-1', false)

    expect(cacheTag).toHaveBeenCalledWith('events:public')
    expect(cacheTag).toHaveBeenCalledWith('event:event-1')
    expect(cacheTag).toHaveBeenCalledWith('project:project-1')
  })

  it('adds no project tag when it has no project', async () => {
    mockFetch.mockResolvedValueOnce({ id: 'event-1' } as never)

    await fetchCachedEventById('event-1', true)

    expect(cacheTag).toHaveBeenCalledWith('events:authed')
    expect(cacheTag).not.toHaveBeenCalledWith(
      expect.stringMatching(/^project:/)
    )
  })
})
