jest.mock('@/lib/db', () => ({
  sql: Object.assign(jest.fn().mockResolvedValue([]), {
    unsafe: jest.fn((raw: string) => ({ raw }))
  })
}))

import { sql } from '@/lib/db'
import { projectTypes } from '@/lib/projects/schemas'
import { pagePaths } from '@/lib/schemas'
import { createTables } from '@/seed/createTables'

const mockSql = jest.mocked(sql)

/** The `sql` call whose text contains `needle`, as text + params. */
function findQuery(needle: string) {
  const call = mockSql.mock.calls.find(([strings]) =>
    (strings as unknown as string[]).join('?').includes(needle)
  )
  if (!call) throw new Error(`No query containing ${needle}`)
  const [strings, ...values] = call
  return { text: (strings as unknown as string[]).join('?'), values }
}

describe('createTables', () => {
  beforeAll(async () => {
    await createTables()
  })

  it('no longer creates the projects type CHECK inline', () => {
    const { text } = findQuery('CREATE TABLE IF NOT EXISTS projects')
    expect(text).not.toContain('type IN')
  })

  it('rebuilds the projects type CHECK from projectTypes', () => {
    const { text, values } = findQuery('chk_projects_type')

    expect(text).toContain("a.attname = 'type'")
    expect(text).toContain('DROP CONSTRAINT')
    expect(values).toEqual([
      { raw: projectTypes.map((type) => `'${type}'`).join(', ') }
    ])
    expect(projectTypes).toContain('solo')
  })

  it('upserts slug history so a slug can be given up twice', () => {
    const { text } = findQuery(
      'CREATE OR REPLACE FUNCTION save_old_slug'
    )

    expect(text).toContain(
      'ON CONFLICT (table_name, old_slug) DO UPDATE'
    )
    expect(text).toContain('SET row_id = EXCLUDED.row_id')
  })

  it('runs the slug history trigger SQL for every page table', () => {
    /** Params of every query whose text contains `keyword`. */
    function paramsOf(keyword: string) {
      return mockSql.mock.calls
        .filter(([strings]) =>
          (strings as unknown as string[]).join('?').includes(keyword)
        )
        .map(([, ...values]) => values)
    }

    for (const table of pagePaths) {
      const expected = [{ raw: `trg_${table}_slug` }, { raw: table }]
      expect(paramsOf('DROP TRIGGER')).toContainEqual(expected)
      expect(paramsOf('CREATE TRIGGER')).toContainEqual(expected)
    }
  })

  it('no longer creates featured_embed_code_id on projects or events', () => {
    for (const table of ['projects', 'events']) {
      const { text } = findQuery(
        `CREATE TABLE IF NOT EXISTS ${table}`
      )
      expect(text).not.toContain('featured_embed_code_id')
    }
  })

  it('moves featured embed codes to the front, then drops the column', () => {
    const calls = mockSql.mock.calls.filter(([strings]) =>
      (strings as unknown as string[])
        .join('?')
        .includes('DROP COLUMN featured_embed_code_id')
    )
    expect(calls.map(([, ...values]) => values)).toEqual(
      ['projects', 'events'].map((table) =>
        Array(3).fill({ raw: table })
      )
    )
    const text = (calls[0][0] as unknown as string[]).join('?')
    expect(text).toContain("column_name = 'featured_embed_code_id'")
    expect(text).toContain('array_prepend(')
    expect(text.indexOf('array_prepend(')).toBeLessThan(
      text.indexOf('DROP COLUMN')
    )
  })
})
