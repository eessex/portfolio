import { cacheTag } from 'next/cache'

jest.mock('@/lib/projects/data', () => ({
  fetchDefaultProject: jest.fn(),
  fetchProjectById: jest.fn(),
  fetchProjectsRaw: jest.fn()
}))

import { fetchProjects } from '@/lib/projects/cached'
import { fetchProjectsRaw } from '@/lib/projects/data'

describe('fetchProjects', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serves the first page from the cache', async () => {
    await fetchProjects(false)

    expect(cacheTag).toHaveBeenCalledWith('projects')
    expect(fetchProjectsRaw).toHaveBeenCalledWith(
      false,
      undefined,
      undefined,
      { isDefaultExcluded: false }
    )
  })

  it('threads isDefaultExcluded to the cached first page', async () => {
    await fetchProjects(true, undefined, undefined, {
      isDefaultExcluded: true
    })

    expect(cacheTag).toHaveBeenCalledWith('projects')
    expect(fetchProjectsRaw).toHaveBeenCalledWith(
      true,
      undefined,
      undefined,
      { isDefaultExcluded: true }
    )
  })

  it('fetches later pages and searches uncached', async () => {
    await fetchProjects(false, 'cursor')
    await fetchProjects(false, undefined, 'query', {
      isDefaultExcluded: true
    })

    expect(cacheTag).not.toHaveBeenCalled()
    expect(fetchProjectsRaw).toHaveBeenCalledWith(
      false,
      'cursor',
      undefined,
      { isDefaultExcluded: false }
    )
    expect(fetchProjectsRaw).toHaveBeenCalledWith(
      false,
      undefined,
      'query',
      { isDefaultExcluded: true }
    )
  })
})
