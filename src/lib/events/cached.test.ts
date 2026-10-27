import { cacheTag } from 'next/cache'

jest.mock('@/lib/events/data', () => ({
  fetchEventById: jest.fn(),
  fetchEventsRaw: jest.fn(),
  fetchUpcomingEventsRaw: jest.fn()
}))

import {
  fetchCachedEventById,
  fetchEvents
} from '@/lib/events/cached'
import { fetchEventById, fetchEventsRaw } from '@/lib/events/data'

const mockFetch = jest.mocked(fetchEventById)

describe('fetchCachedEventById', () => {
  beforeEach(() => jest.clearAllMocks())

  it('tags the cache with its project, so project edits invalidate it', async () => {
    mockFetch.mockResolvedValueOnce({
      id: 'event-1',
      projectId: 'project-1'
    } as never)

    await fetchCachedEventById('event-1', false)

    expect(cacheTag).toHaveBeenCalledWith('events')
    expect(cacheTag).toHaveBeenCalledWith('event:event-1')
    expect(cacheTag).toHaveBeenCalledWith('project:project-1')
  })

  it('adds no project tag when it has no project', async () => {
    mockFetch.mockResolvedValueOnce({ id: 'event-1' } as never)

    await fetchCachedEventById('event-1', true)

    expect(cacheTag).not.toHaveBeenCalledWith(
      expect.stringMatching(/^project:/)
    )
  })
})

describe('fetchEvents', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serves the first page from the cache', async () => {
    await fetchEvents(false, 'project-1')

    expect(cacheTag).toHaveBeenCalledWith('events')
    expect(fetchEventsRaw).toHaveBeenCalledWith(
      false,
      'project-1',
      undefined,
      undefined
    )
  })

  it('fetches later pages and searches uncached', async () => {
    await fetchEvents(true, undefined, 'cursor')
    await fetchEvents(true, 'project-1', undefined, 'query')

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchEventsRaw).toHaveBeenCalledWith(
      true,
      undefined,
      'cursor',
      undefined
    )
    expect(fetchEventsRaw).toHaveBeenCalledWith(
      true,
      'project-1',
      undefined,
      'query'
    )
  })
})
