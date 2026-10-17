import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { projectFixtureBand } from '@/lib/projects/fixtures'

jest.mock('@/lib/projects/cached', () => ({
  fetchCachedProjectsFirstPage: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

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

    expect(mockCached).toHaveBeenCalledWith(false, false)
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

  it('threads isDefaultExcluded to the cached first page', async () => {
    mockCached.mockResolvedValue({
      res: { allProjects: [] },
      nextCursor: null,
      totalCount: 0
    })

    await Projects.fetchProjects(false, undefined, undefined, {
      isDefaultExcluded: true
    })

    expect(mockCached).toHaveBeenCalledWith(false, true)
  })

  it('threads isDefaultExcluded to the raw fetch', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([])

    await Projects.fetchProjects(false, undefined, 'band', {
      isDefaultExcluded: true
    })

    expect(defaultExcludedParams()).toEqual([true, true])
  })
})

/**
 * The value bound to `NOT ${isDefaultExcluded}` in each `sql` call
 * (count, then list).
 */
function defaultExcludedParams() {
  return mockSql.mock.calls.map(([strings, ...values]) => {
    const index = (strings as unknown as string[]).findIndex((part) =>
      part.trimEnd().endsWith('AND (NOT')
    )
    return values[index]
  })
}

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

  it('keeps the default project unless isDefaultExcluded', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([projectFixtureBand])

    await Projects.fetchProjectsRaw(false)

    expect(defaultExcludedParams()).toEqual([false, false])
  })

  it('filters the default project from count and list when isDefaultExcluded', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([projectFixtureBand])

    await Projects.fetchProjectsRaw(false, undefined, undefined, {
      isDefaultExcluded: true
    })

    expect(defaultExcludedParams()).toEqual([true, true])
    mockSql.mock.calls.forEach(([strings]) => {
      expect((strings as unknown as string[]).join('?')).toContain(
        'OR NOT p.is_default_project'
      )
    })
  })

  it('lists the default project first, and only on the first page', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([projectFixtureBand])

    await Projects.fetchProjectsRaw(false)

    const listText = (
      mockSql.mock.calls[1]?.[0] as unknown as string[]
    ).join('?')
    expect(listText).toMatch(/ORDER BY\s+p\.is_default_project DESC/)
    expect(listText).toMatch(
      /IS NULL\s+OR \(\s+NOT p\.is_default_project\s+AND/
    )
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

  it('derives cover-image URLs for nested embed codes', async () => {
    mockSql.mockResolvedValue([
      {
        ...projectFixtureBand,
        embedCodes: [embedCodeFixture]
      }
    ])

    const result = await Projects.fetchProjectById(
      projectFixtureBand.id
    )

    expect(result?.embedCodes?.[0].coverImageUrl).toContain(
      embedCodeFixture.coverImageId
    )
  })

  it.each([
    ['images', 'image_ids', 'i'],
    ['embed codes', 'embed_code_ids', 'ec']
  ])('orders %s by their position in %s', async (_, ids, alias) => {
    mockSql.mockResolvedValue([projectFixtureBand])

    await Projects.fetchProjectById(projectFixtureBand.id)

    const [strings] = mockSql.mock.calls[0]
    expect((strings as unknown as string[]).join('?')).toContain(
      `ORDER BY array_position(p.${ids}, ${alias}.id)`
    )
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

describe('fetchDefaultProject', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('looks up the flagged project, then fetches it by id', async () => {
    const defaultProject = {
      ...projectFixtureBand,
      isDefaultProject: true
    }
    mockSql
      .mockResolvedValueOnce([{ id: projectFixtureBand.id }])
      .mockResolvedValueOnce([defaultProject])

    const result = await Projects.fetchDefaultProject(true)

    expect(result).toEqual(defaultProject)
    const [[lookup, isAuthed], [, byId]] = mockSql.mock.calls
    expect(lookup.join('?')).toContain('WHERE is_default_project')
    expect(lookup.join('?')).toContain('OR is_published = true')
    expect(isAuthed).toBe(true)
    expect(byId).toBe(projectFixtureBand.id)
  })

  it('passes isAuthed through to both queries', async () => {
    mockSql
      .mockResolvedValueOnce([{ id: projectFixtureBand.id }])
      .mockResolvedValueOnce([projectFixtureBand])

    await Projects.fetchDefaultProject()

    const [[, lookupAuthed], [, , byIdAuthed]] = mockSql.mock.calls
    expect(lookupAuthed).toBe(false)
    expect(byIdAuthed).toBe(false)
  })

  it('returns undefined when there is no default project', async () => {
    mockSql.mockResolvedValueOnce([])

    const result = await Projects.fetchDefaultProject()

    expect(result).toBeUndefined()
    expect(mockSql).toHaveBeenCalledTimes(1)
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValueOnce(new Error('db exploded'))

    await expect(Projects.fetchDefaultProject()).rejects.toThrow(
      'Failed to fetch default project.'
    )
  })
})
