import { cacheTag } from 'next/cache'

jest.mock('@/lib/releases/data', () => ({
  fetchReleaseById: jest.fn(),
  fetchReleasesRaw: jest.fn()
}))

import {
  fetchCachedReleaseById,
  fetchReleases
} from '@/lib/releases/cached'
import {
  fetchReleaseById,
  fetchReleasesRaw
} from '@/lib/releases/data'

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
    expect(cacheTag).toHaveBeenCalledWith('release:release-1')
    expect(cacheTag).toHaveBeenCalledWith('project:project-1')
  })

  it('adds no project tag when it has no project', async () => {
    mockFetch.mockResolvedValueOnce({ id: 'release-1' } as never)

    await fetchCachedReleaseById('release-1', true)

    expect(cacheTag).not.toHaveBeenCalledWith(
      expect.stringMatching(/^project:/)
    )
  })
})

describe('fetchReleases', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serves the first page from the cache', async () => {
    await fetchReleases(false, 'project-1')

    expect(cacheTag).toHaveBeenCalledWith('releases')
    expect(fetchReleasesRaw).toHaveBeenCalledWith(
      false,
      'project-1',
      undefined,
      undefined
    )
  })

  it('fetches later pages and searches uncached', async () => {
    await fetchReleases(true, undefined, 'cursor')
    await fetchReleases(true, 'project-1', undefined, 'query')

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchReleasesRaw).toHaveBeenCalledWith(
      true,
      undefined,
      'cursor',
      undefined
    )
    expect(fetchReleasesRaw).toHaveBeenCalledWith(
      true,
      'project-1',
      undefined,
      'query'
    )
  })
})
