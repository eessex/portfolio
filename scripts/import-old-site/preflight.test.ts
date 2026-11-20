/**
 * @jest-environment node
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import type { Sql } from '../migrate-mongo/plan'
import { checkDatabase, databaseHost, exportFiles } from './preflight'

function mockSql(...results: unknown[][]) {
  const sql = jest.fn()
  for (const rows of results) sql.mockResolvedValueOnce(rows)
  return sql as unknown as Sql
}

const counts = (
  overrides: Partial<{
    users: number
    imported: number
    other_items: number
  }> = {}
) => [{ users: 1, imported: 0, other_items: 0, ...overrides }]

describe('#checkDatabase', () => {
  it('passes a migrated, claimed, empty site', async () => {
    const result = await checkDatabase(
      mockSql([{ t: 'legacy_ids' }], counts())
    )
    expect(result).toEqual({ errors: [], warnings: [] })
  })

  it('stops before counting when migrations never ran', async () => {
    const sql = mockSql([{ t: null }])
    const { errors } = await checkDatabase(sql)
    expect(errors[0]).toMatch('no tables yet')
    expect(sql).toHaveBeenCalledTimes(1)
  })

  it('requires a claimed site', async () => {
    const { errors } = await checkDatabase(
      mockSql([{ t: 'legacy_ids' }], counts({ users: 0 }))
    )
    expect(errors[0]).toMatch('/setup')
  })

  it('warns about earlier imports and existing content', async () => {
    const { errors, warnings } = await checkDatabase(
      mockSql(
        [{ t: 'legacy_ids' }],
        counts({ imported: 12, other_items: 3 })
      )
    )
    expect(errors).toEqual([])
    expect(warnings).toHaveLength(2)
    expect(warnings[0]).toMatch('12 rows came from an earlier import')
    expect(warnings[1]).toMatch('3 event(s)')
  })
})

describe('#exportFiles', () => {
  let dir: string
  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'import-old-site-'))
  })
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('lists only the collection files the import reads', async () => {
    await writeFile(path.join(dir, 'events.json'), '[]')
    await writeFile(path.join(dir, 'notes.txt'), '')
    expect(await exportFiles(dir)).toEqual(['events.json'])
  })

  it('returns nothing for a missing folder', async () => {
    expect(await exportFiles(path.join(dir, 'nope'))).toEqual([])
  })
})

describe('#databaseHost', () => {
  it('shows only the host, never the password', () => {
    expect(
      databaseHost(
        'postgres://u:secret@ep-x.neon.tech/db?sslmode=require'
      )
    ).toBe('ep-x.neon.tech')
    expect(databaseHost('not a url')).toBeUndefined()
  })
})
