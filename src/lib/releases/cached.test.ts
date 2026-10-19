import { cacheTag } from 'next/cache'

jest.mock('@/lib/releases/data', () => ({
  fetchReleaseById: jest.fn(),
  fetchReleasesRaw: jest.fn()
}))

import { fetchCachedReleaseById } from '@/lib/releases/cached'
import { fetchReleaseById } from '@/lib/releases/data'

const mockFetch = jest.mocked(fetchReleaseById)

describe('fetchCachedReleaseById', () => {
  beforeEach(() => jest.clearAllMocks())

  it('tags the cache with its project, so project edits invalidate it', async () => {
    mockFetch.mockResolvedValueOnce({
      id: 'release-1',
      projectId: 'project-1'
    } as never)

    await fetchCachedReleaseById('release-1', false)

    expect(cacheTag).toHaveBeenCalledWith('releases')
    expect(cacheTag).toHaveBeenCalledWith('releases:public')
    expect(cacheTag).toHaveBeenCalledWith('release:release-1')
    expect(cacheTag).toHaveBeenCalledWith('project:project-1')
  })

  it('adds no project tag when it has no project', async () => {
    mockFetch.mockResolvedValueOnce({ id: 'release-1' } as never)

    await fetchCachedReleaseById('release-1', true)

    expect(cacheTag).toHaveBeenCalledWith('releases:authed')
    expect(cacheTag).not.toHaveBeenCalledWith(
      expect.stringMatching(/^project:/)
    )
  })
})
