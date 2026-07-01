import { projectFixtureBand } from '@/lib/projects/fixtures'

jest.mock('@/lib/projects/cached', () => ({
  fetchCachedProjectsFirstPage: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

jest.mock('@/lib/projects/data', () => {
  const actual = jest.requireActual('@/lib/projects/data')

  return {
    ...actual,
    getTotalCount: jest.fn().mockResolvedValue(1)
  }
})

jest.mock('@/lib/slug/util', () => {
  const actual = jest.requireActual('@/lib/slug/util')

  return {
    ...actual,
    resolveSlug: jest.fn(() => ({
      id: projectFixtureBand.id,
      slug: projectFixtureBand.slug,
      isRedirect: true
    })),
    getTableIdentifier: jest.fn(() => ({ mockedTable: 'projects' }))
  }
})

import { sql } from '@/lib/db'
import { fetchCachedProjectsFirstPage } from '@/lib/projects/cached'
import * as Projects from '@/lib/projects/data'

const mockSql = jest.mocked(sql)
const mockCached = jest.mocked(fetchCachedProjectsFirstPage)

describe('fetchProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cached first page when no cursor and no query', async () => {
    mockCached.mockResolvedValue({
      res: {
        allProjects: [projectFixtureBand]
      },
      nextCursor: 'next',
      totalCount: 1
    })

    const result = await Projects.fetchProjects(false)

    expect(mockCached).toHaveBeenCalledWith(false)
    expect(result).toEqual({
      res: {
        allProjects: [projectFixtureBand]
      },
      nextCursor: 'next',
      totalCount: 1
    })
  })

  it('falls back to raw fetch when cursor is provided', async () => {
    mockSql.mockResolvedValue([])

    const result = await Projects.fetchProjects(false, 'cursor')

    expect(result).toBeDefined()
  })
})

describe('fetchProjectsRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted projects', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValue([projectFixtureBand])

    const result = await Projects.fetchProjectsRaw(
      false,
      undefined,
      'test'
    )

    expect(result).toEqual({
      res: {
        allProjects: [projectFixtureBand]
      },
      nextCursor: null,
      totalCount: 1
    })
  })

  it('handles DB errors', async () => {
    mockSql.mockResolvedValueOnce([{ count: 1 }])
    mockSql.mockRejectedValue(new Error('db failed'))

    await expect(Projects.fetchProjectsRaw()).rejects.toThrow(
      'Failed to fetch projects.'
    )
  })
})

describe('fetchProjectById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns formatted project when found', async () => {
    mockSql.mockResolvedValue([projectFixtureBand])

    const result = await Projects.fetchProjectById(
      projectFixtureBand.id
    )

    expect(result).toEqual(projectFixtureBand)
  })

  it('returns undefined when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await Projects.fetchProjectById('missing')

    expect(result).toBeUndefined()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      Projects.fetchProjectById(projectFixtureBand.id)
    ).rejects.toThrow(
      `Failed to fetch project: ${projectFixtureBand.id}.`
    )
  })
})
