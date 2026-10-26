/**
 * @jest-environment node
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import baseline from '../../migrations/0001_baseline'

const BASELINE_PATH = join(
  __dirname,
  '../../migrations/0001_baseline.ts'
)

const query = jest.fn().mockResolvedValue({ rows: [] })

const texts = () => query.mock.calls.map(([text]) => text as string)

function find(needle: string) {
  const text = texts().find((t) => t.includes(needle))
  if (!text) throw new Error(`No statement containing ${needle}`)
  return text
}

describe('0001_baseline', () => {
  beforeAll(async () => {
    await baseline({ query })
  })

  it('imports no app code, so it never changes', async () => {
    const source = await readFile(BASELINE_PATH, 'utf8')
    expect(source).not.toMatch(/^\s*import\b/m)
  })

  it('only creates, never alters or drops', () => {
    for (const text of texts()) {
      expect(text).toMatch(
        /^CREATE (EXTENSION|TABLE|UNIQUE INDEX|INDEX) IF NOT EXISTS/
      )
    }
  })

  it('creates every table', () => {
    const tables = texts()
      .map((t) => /^CREATE TABLE IF NOT EXISTS (\w+)/.exec(t)?.[1])
      .filter(Boolean)
    expect(tables).toEqual([
      'projects',
      'tags',
      'slug_history',
      'users',
      'login_attempts',
      'rate_limit_events',
      'images',
      'embed_codes',
      'links',
      'site_settings',
      'email_subscriptions',
      'venues',
      'releases',
      'publishers',
      'published_editions',
      'events',
      'legacy_ids'
    ])
  })

  it('creates the uuid extension before any table', () => {
    expect(texts()[0]).toBe(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'
    )
  })

  it('leaves value lists to the every-deploy CHECKs', () => {
    for (const text of texts()) expect(text).not.toMatch(/\bIN \(/)
  })

  it('escapes the email regex dot for Postgres', () => {
    expect(find('CREATE TABLE IF NOT EXISTS users')).toContain(
      "'^[^@]+@[^@]+\\.[^@]+$'"
    )
  })

  it('requires an event venue to exist and its slug to be unique', () => {
    expect(find('CREATE TABLE IF NOT EXISTS events')).toContain(
      'FOREIGN KEY (venue_id) REFERENCES venues(id)'
    )
    expect(find('idx_events_slug')).toContain('UNIQUE')
  })

  it('flags at most one publisher as built in', () => {
    expect(find('CREATE TABLE IF NOT EXISTS publishers')).toContain(
      'is_built_in BOOLEAN NOT NULL DEFAULT false'
    )
    expect(find('idx_publishers_single_built_in')).toContain(
      'WHERE is_built_in'
    )
  })

  it('allows at most one default project', () => {
    expect(find('idx_projects_single_default')).toContain(
      'WHERE is_default_project'
    )
  })
})
