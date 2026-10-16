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
})
