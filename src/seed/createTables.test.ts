jest.mock('@/lib/db', () => ({
  sql: Object.assign(jest.fn().mockResolvedValue([]), {
    unsafe: jest.fn((raw: string) => ({ raw }))
  })
}))

import { sql } from '@/lib/db'
import {
  embedCodeContentTypes,
  embedCodeHosts,
  embedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { imageTypes } from '@/lib/images/schemas/db'
import { linkTypes } from '@/lib/links/schemas/db'
import { projectTypes } from '@/lib/projects/schemas'
import { publishedEditionTypes } from '@/lib/published-editions/schemas/db'
import { publisherTypes } from '@/lib/publishers/schemas/db'
import { releaseTypes } from '@/lib/releases/schemas'
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

  it.each([
    ['projects', 'type', projectTypes],
    ['images', 'type', imageTypes],
    ['embed_codes', 'type', embedCodeTypes],
    ['embed_codes', 'host', embedCodeHosts],
    ['embed_codes', 'content_type', embedCodeContentTypes],
    ['links', 'type', linkTypes],
    ['publishers', 'type', publisherTypes],
    ['releases', 'type', releaseTypes],
    ['published_editions', 'format', publishedEditionTypes]
  ])(
    'rebuilds the %s.%s CHECK from its constant',
    (table, column, values) => {
      const call = mockSql.mock.calls.find(
        ([strings, ...params]) =>
          (strings as unknown as string[])
            .join('?')
            .includes('ADD CONSTRAINT') &&
          params.some(
            (p) =>
              (p as { raw?: string }).raw === `chk_${table}_${column}`
          )
      )
      expect(call).toBeDefined()
      const [strings, ...params] = call!
      expect((strings as unknown as string[]).join('?')).toContain(
        'DROP CONSTRAINT %I'
      )
      expect(params).toContainEqual({
        raw: values.map((v) => `'${v}'`).join(', ')
      })
    }
  )

  it.each([
    [
      'embed_codes',
      'content_type',
      {
        dj_set: 'djSet',
        live_performance: 'livePerformance',
        official_audio: 'officialAudio',
        official_music_video: 'officialMusicVideo',
        radio_show: 'radioShow'
      }
    ],
    [
      'links',
      'type',
      { buy_link: 'buyLink', stream_link: 'streamLink' }
    ],
    [
      'releases',
      'type',
      { collaborative_release: 'collaborativeRelease' }
    ]
  ])(
    'renames old %s.%s values between dropping and adding the CHECK',
    (table, column, renames) => {
      const call = mockSql.mock.calls.find(([, ...params]) =>
        params.some(
          (p) =>
            (p as { raw?: string }).raw === `chk_${table}_${column}`
        )
      )!
      const [strings, ...params] = call
      const update = params.find((p) =>
        (p as { raw?: string }).raw?.startsWith(`UPDATE ${table} `)
      ) as { raw: string }
      for (const [from, to] of Object.entries(renames)) {
        expect(update.raw).toContain(`WHEN '${from}' THEN '${to}'`)
      }
      expect(update.raw).toContain(
        `WHERE ${column} IN (${Object.keys(renames)
          .map((v) => `'${v}'`)
          .join(', ')})`
      )
      const text = (strings as unknown as string[]).join('?')
      const updateAt = params.indexOf(update)
      const placeholderAt = (i: number) =>
        (strings as unknown as string[]).slice(0, i + 1).join('?')
          .length
      expect(placeholderAt(updateAt)).toBeGreaterThan(
        text.indexOf('END LOOP')
      )
      expect(placeholderAt(updateAt)).toBeLessThan(
        text.indexOf('ADD CONSTRAINT')
      )
    }
  )

  it('leaves value lists out of CREATE TABLE', () => {
    const creates = mockSql.mock.calls
      .map(([strings]) => (strings as unknown as string[]).join('?'))
      .filter((text) => text.includes('CREATE TABLE'))
    for (const text of creates) expect(text).not.toMatch(/\bIN \(/)
  })

  it('marks the edition JSON builder STABLE, since it reads other tables', () => {
    expect(
      findQuery('FUNCTION build_published_edition_json').text
    ).toContain('LANGUAGE plpgsql STABLE')
  })

  it('requires an event venue to exist and its slug to be unique', () => {
    expect(
      findQuery('CREATE TABLE IF NOT EXISTS events').text
    ).toContain('FOREIGN KEY (venue_id) REFERENCES venues(id)')
    expect(
      findQuery('CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug')
    ).toBeDefined()
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

  describe('built-in Self-released publisher', () => {
    it('flags at most one publisher as built in', () => {
      expect(
        findQuery('CREATE TABLE IF NOT EXISTS publishers').text
      ).toContain('is_built_in BOOLEAN NOT NULL DEFAULT false')
      expect(
        findQuery('idx_publishers_single_built_in').text
      ).toContain('WHERE is_built_in')
    })

    it('creates the Self-released record label unless one exists', () => {
      const create = findQuery(
        'INSERT INTO publishers (name, type, is_built_in)'
      )

      expect(create.values).toEqual(['Self-released', 'recordLabel'])
      expect(create.text).toContain(
        'NOT EXISTS (SELECT 1 FROM publishers WHERE is_built_in)'
      )
    })

    it('includes the flag in publisher JSON', () => {
      expect(
        findQuery('FUNCTION build_publisher_json').text
      ).toContain("'isBuiltIn', p.is_built_in")
    })
  })
})
