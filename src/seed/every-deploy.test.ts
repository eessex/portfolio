import { createHash } from 'node:crypto'

import {
  embedCodeContentTypes,
  embedCodeHosts,
  embedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { imageFormats, imageTypes } from '@/lib/images/schemas/db'
import { linkTypes } from '@/lib/links/schemas/db'
import { projectTypes } from '@/lib/projects/schemas'
import { publishedEditionTypes } from '@/lib/published-editions/schemas/db'
import { publisherTypes } from '@/lib/publishers/schemas/db'
import { releaseTypes } from '@/lib/releases/schemas'
import { pagePaths } from '@/lib/schemas'
import {
  EVERY_DEPLOY_REVISION,
  everyDeploySteps
} from '@/seed/every-deploy'

const query = jest.fn().mockResolvedValue({ rows: [] })

const texts = () => query.mock.calls.map(([text]) => text as string)

/** The query whose text contains `needle`, as text + params. */
function findQuery(needle: string) {
  const call = query.mock.calls.find(([text]) =>
    (text as string).includes(needle)
  )
  if (!call) throw new Error(`No query containing ${needle}`)
  const [text, values] = call as [string, unknown[] | undefined]
  return { text, values }
}

function queryIndex(needle: string) {
  return texts().findIndex((text) => text.includes(needle))
}

describe('everyDeploySteps', () => {
  beforeAll(async () => {
    for (const step of everyDeploySteps) await step.run({ query })
  })

  // Changing any step's SQL fails this: bump EVERY_DEPLOY_REVISION,
  // then update both, so older builds can't re-apply the old SQL
  it('pins the SQL to EVERY_DEPLOY_REVISION', () => {
    const checksum = createHash('sha256')
      .update(JSON.stringify(query.mock.calls))
      .digest('hex')
    expect({ revision: EVERY_DEPLOY_REVISION, checksum }).toEqual({
      revision: 2,
      checksum:
        'e7729c7b4dadfc75eab910810208a4d8f0ccda4f6e22dcc9b23b5476fa62d9b9'
    })
  })

  it.each([
    ['projects', 'type', projectTypes],
    ['images', 'type', imageTypes],
    ['images', 'format', imageFormats],
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
      const { text } = findQuery(
        `ADD CONSTRAINT chk_${table}_${column} `
      )
      expect(text).toContain(`'${table}'::regclass`)
      expect(text).toContain('DROP CONSTRAINT %I')
      expect(text).toContain(
        `CHECK (${column} IN (${values.map((v) => `'${v}'`).join(', ')}))`
      )
    }
  )

  // a rebuild locks the table against reads, so most deploys skip it
  it('skips a CHECK that already allows exactly its constant', () => {
    const { text } = findQuery('ADD CONSTRAINT chk_links_type ')
    expect(text).toContain(
      `allowed text[] := ARRAY[${linkTypes.map((v) => `'${v}'`).join(', ')}]::text[]`
    )
    expect(text).toContain("con.conname = 'chk_links_type'")
    expect(text).toMatch(
      /con\.literals <@ allowed\s+AND allowed <@ con\.literals/
    )
    expect(text.indexOf('RETURN;')).toBeLessThan(
      text.indexOf('DROP CONSTRAINT')
    )
  })

  it('defines save_old_slug before the triggers that call it', () => {
    expect(
      queryIndex('CREATE OR REPLACE FUNCTION save_old_slug')
    ).toBeLessThan(queryIndex('CREATE OR REPLACE TRIGGER'))
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

  it('replaces the slug history trigger for every page table atomically', () => {
    for (const table of pagePaths) {
      expect(
        findQuery(`CREATE OR REPLACE TRIGGER trg_${table}_slug`).text
      ).toContain(`BEFORE UPDATE OF slug ON ${table}`)
    }
    // a separate DROP would leave a gap where live edits skip history
    expect(
      texts().some((text) => text.includes('DROP TRIGGER'))
    ).toBe(false)
  })

  it('skips a slug trigger that already matches', () => {
    const { text } = findQuery(
      'CREATE OR REPLACE TRIGGER trg_events_slug'
    )
    expect(text).toContain('IF NOT EXISTS')
    expect(text).toContain(
      "'CREATE TRIGGER %I BEFORE UPDATE OF slug ON %I.%I FOR EACH ROW EXECUTE FUNCTION save_old_slug()'"
    )
    expect(text.indexOf('IF NOT EXISTS')).toBeLessThan(
      text.indexOf('CREATE OR REPLACE TRIGGER')
    )
  })

  it('marks the edition JSON builder STABLE, since it reads other tables', () => {
    expect(
      findQuery('FUNCTION build_published_edition_json').text
    ).toContain('LANGUAGE plpgsql STABLE')
  })

  describe('page item SQL helpers', () => {
    it('defines the cover image helpers after what they call', () => {
      // SQL function bodies are checked against existing functions
      const resolve = queryIndex('FUNCTION resolve_cover_image_id')
      const imageJson = queryIndex('FUNCTION build_image_json')
      const coverJson = queryIndex('FUNCTION build_cover_image_json')
      expect(resolve).toBeGreaterThan(-1)
      expect(imageJson).toBeGreaterThan(-1)
      expect(coverJson).toBeGreaterThan(Math.max(resolve, imageJson))
      expect(
        queryIndex('FUNCTION build_project_json')
      ).toBeGreaterThan(coverJson)
    })

    it.each([
      ['build_cover_image_json', 'images'],
      ['has_embed_code_type', 'embed_codes']
    ])('marks %s STABLE, since it reads %s', (name) => {
      expect(findQuery(`FUNCTION ${name}`).text).toContain(
        'LANGUAGE sql STABLE'
      )
    })

    it('resolves a project’s cover through the shared helper', () => {
      expect(findQuery('FUNCTION build_project_json').text).toContain(
        'build_cover_image_json(p.cover_image_id, p.image_ids)'
      )
    })
  })

  describe('built-in Self-released publisher', () => {
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
