import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { projectFixtureBand } from '@/lib/projects/fixtures'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import * as Projects from '@/lib/projects/data'

const mockSql = jest.mocked(sql)

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

/** The value bound right after the SQL text ending in `before` */
function boundAfter(call: number, before: string) {
  const [strings, ...values] = mockSql.mock.calls[call]!
  const index = (strings as unknown as string[]).findIndex((part) =>
    part.trimEnd().endsWith(before)
  )
  return index === -1 ? 'not found' : values[index]
}

function listText() {
  return (mockSql.mock.calls[1]?.[0] as unknown as string[]).join('?')
}

function pageOf(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...projectFixtureBand,
    id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
  }))
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

  it('filters count and list by types, unfiltered by default', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([projectFixtureBand])
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([projectFixtureBand])

    await Projects.fetchProjectsRaw(false, undefined, undefined, {
      types: ['band', 'solo']
    })
    expect(boundAfter(0, 'AND (')).toEqual(['band', 'solo'])
    expect(boundAfter(1, 'AND (')).toEqual(['band', 'solo'])

    await Projects.fetchProjectsRaw(false)
    expect(boundAfter(2, 'AND (')).toBeNull()
    expect(boundAfter(3, 'AND (')).toBeNull()
  })

  it('leaves out excludedTypes, keeping untyped projects', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([projectFixtureBand])

    await Projects.fetchProjectsRaw(false, undefined, undefined, {
      excludedTypes: ['band', 'solo']
    })
    for (const call of [0, 1]) {
      expect(
        boundAfter(call, 'p.type IS NULL OR NOT (p.type = ANY(')
      ).toEqual(['band', 'solo'])
    }
  })

  it('orders by name, with a title cursor', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 30 }])
      .mockResolvedValueOnce(
        pageOf(24).map((p, i) => ({ ...p, title: `Artist ${i}` }))
      )

    const { nextCursor } = await Projects.fetchProjectsRaw(
      false,
      undefined,
      undefined,
      { orderBy: 'name' }
    )

    expect(listText()).toMatch(
      /ORDER BY\s+p\.is_default_project DESC,\s+LOWER\(p\.title\) ASC,\s+p\.id ASC/
    )
    expect(
      JSON.parse(Buffer.from(nextCursor!, 'base64').toString())
    ).toEqual({
      name: 'Artist 23',
      id: '00000000-0000-4000-8000-000000000023'
    })
  })

  it('continues a name cursor after its title', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 30 }])
      .mockResolvedValueOnce([projectFixtureBand])
    const cursor = Buffer.from(
      JSON.stringify({ name: 'Mid', id: 'abc' })
    ).toString('base64')

    await Projects.fetchProjectsRaw(false, cursor, undefined, {
      orderBy: 'name'
    })

    expect(boundAfter(1, 'LOWER(p.title) > LOWER(')).toBe('Mid')
  })

  it('sorts undated projects last, and records it in the date cursor', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 30 }])
      .mockResolvedValueOnce(
        pageOf(24).map((p) => ({
          ...p,
          startDate: undefined,
          endDate: undefined
        }))
      )

    const { nextCursor } = await Projects.fetchProjectsRaw(false)

    expect(listText()).toMatch(
      /\(p\.end_date IS NOT NULL\),\s+\(p\.start_date IS NULL\),\s+p\.start_date DESC/
    )
    expect(
      JSON.parse(Buffer.from(nextCursor!, 'base64').toString())
    ).toMatchObject({ hasEndDate: 'false', hasStartDate: 'false' })
  })

  it('continues a date cursor into later groups, not earlier ones', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 30 }])
      .mockResolvedValueOnce([projectFixtureBand])
    const cursor = Buffer.from(
      JSON.stringify({
        name: '2020-01-01T00:00:00.000Z',
        id: 'abc',
        hasEndDate: 'false',
        hasStartDate: 'true'
      })
    ).toString('base64')

    await Projects.fetchProjectsRaw(false, cursor)

    // ongoing ('false') sorts first, so ended rows follow it
    expect(listText()).toContain(
      '(p.end_date IS NOT NULL)::text > ?::text'
    )
    expect(boundAfter(1, '(p.end_date IS NOT NULL)::text >')).toBe(
      'false'
    )
    expect(boundAfter(1, '(p.start_date IS NULL)::text > (NOT')).toBe(
      'true'
    )
  })

  it('treats an older cursor without hasStartDate as dated', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 30 }])
      .mockResolvedValueOnce([projectFixtureBand])
    const cursor = Buffer.from(
      JSON.stringify({
        name: '2020-01-01T00:00:00.000Z',
        id: 'abc',
        hasEndDate: 'true'
      })
    ).toString('base64')

    await Projects.fetchProjectsRaw(false, cursor)

    expect(boundAfter(1, '(p.start_date IS NULL)::text > (NOT')).toBe(
      'true'
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
