import { sql } from '@/lib/db'
import type { SlugTableName } from '@/lib/schemas'
import { TablesWithSlugs } from '@/lib/schemas'
import { getTableIdentifier, slugify } from '@/lib/slug/util'

jest.mock('@/lib/db', () => ({
  sql: {
    unsafe: jest.fn((value) => ({ mocked: value }))
  }
}))

describe('slugify', () => {
  it.each([
    ['Hello World', 'hello-world'],
    ['Crème Brûlée', 'creme-brulee'],
    ['Hello, World! @2025', 'hello-world-2025'],
    ['   Hello World   ', 'hello-world'],
    ['hello     world', 'hello-world'],
    ['Version 2 Release 10', 'version-2-release-10'],
    ['     ', ''],
    ['foo - bar', 'foo-bar']
  ])('slugify(%s) -> %s', (input, expected) => {
    expect(slugify(input)).toBe(expected)
  })
})

describe('getTableIdentifier', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls sql.unsafe with a valid table name', () => {
    const table = TablesWithSlugs[0]

    const result = getTableIdentifier(table)

    expect(sql.unsafe).toHaveBeenCalledWith(table)
    expect(result).toEqual({ mocked: table })
  })

  it('throws for an invalid table name', () => {
    expect(() =>
      getTableIdentifier('not_a_table' as unknown as SlugTableName)
    ).toThrow('Invalid table name: not_a_table')

    expect(sql.unsafe).not.toHaveBeenCalled()
  })
})
