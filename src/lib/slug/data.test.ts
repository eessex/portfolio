import { sql } from '@/lib/db'
import { generateUniqueSlug, resolveSlug } from '@/lib/slug/data'
import { getTableIdentifier } from '@/lib/slug/util'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

jest.mock('@/lib/slug/data', () => {
  const actual = jest.requireActual('@/lib/slug/data')

  return {
    ...actual,
    slugExists: jest.fn(() => true)
  }
})

jest.mock('@/lib/slug/util', () => {
  const actual = jest.requireActual('@/lib/slug/util')

  return {
    ...actual,
    getTableIdentifier: jest
      .fn()
      .mockReturnValue({ mockedTable: 'projects' })
  }
})

const mockSql = sql as unknown as jest.Mock
const mockGetTableIdentifier = jest.mocked(getTableIdentifier)

describe('generateUniqueSlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSql.mockImplementation(() => [])
  })

  it('returns the slugified title when it is unique', async () => {
    mockSql.mockResolvedValue([{ exists: false }])

    const slug = await generateUniqueSlug('Hello World', 'projects')

    expect(slug).toBe('hello-world')
    expect(mockSql).toHaveBeenCalledTimes(1)
    // slugExists must resolve the table name via getTableIdentifier
    // rather than interpolating the raw string into the query
    expect(mockGetTableIdentifier).toHaveBeenCalledWith('projects')
  })

  it('appends "-2" when the slug already exists', async () => {
    mockSql
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: false }])

    const slug = await generateUniqueSlug('Hello World', 'projects')

    expect(slug).toBe('hello-world-2')
    expect(mockSql).toHaveBeenCalledTimes(2)
  })

  it('continues incrementing until a unique slug is found', async () => {
    mockSql
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: false }])

    const slug = await generateUniqueSlug('Hello World', 'projects')

    expect(slug).toBe('hello-world-4')
    expect(mockSql).toHaveBeenCalledTimes(4)
  })

  it('uses "untitled" when slugify returns an empty string', async () => {
    mockSql.mockResolvedValue([{ exists: false }])

    const slug = await generateUniqueSlug('!!!', 'projects')

    expect(slug).toBe('untitled')
  })
})

describe('resolveSlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSql.mockImplementation(() => [])
  })

  it('returns the current slug when found', async () => {
    mockSql.mockResolvedValueOnce([
      {
        id: '123',
        slug: 'hello-world'
      }
    ])

    const result = await resolveSlug('projects', 'hello-world')

    expect(result).toEqual({
      id: '123',
      slug: 'hello-world',
      isRedirect: false
    })

    expect(mockSql).toHaveBeenCalledTimes(1)
  })

  it('returns a redirect when the slug exists in history', async () => {
    mockSql.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: '123',
        slug: 'new-slug'
      }
    ])

    const result = await resolveSlug('projects', 'old-slug')

    expect(result).toEqual({
      id: '123',
      slug: 'new-slug',
      isRedirect: true
    })

    expect(mockSql).toHaveBeenCalledTimes(2)
  })

  it('returns null when no matching slug exists', async () => {
    mockSql.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    const result = await resolveSlug('projects', 'missing-slug')

    expect(result).toBeNull()

    expect(mockSql).toHaveBeenCalledTimes(2)
  })
})
