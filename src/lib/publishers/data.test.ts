import { sql } from '@/lib/db'
import { fetchPublishersRaw } from '@/lib/publishers/data'
import { publisherFixtureAlpha } from '@/lib/publishers/fixtures'
import { encodeCursor } from '@/lib/util'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
const mockSql = jest.mocked(sql)

function listQueryText() {
  // count query first, then the page
  return (mockSql.mock.calls[1]?.[0] as unknown as string[]).join('?')
}

describe('fetchPublishersRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSql
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([
        { ...publisherFixtureAlpha, release_slugs: [] }
      ])
  })

  it('lists the house publisher, then the built-in one, first', async () => {
    await fetchPublishersRaw()

    expect(listQueryText()).toMatch(
      /ORDER BY\s+publishers\.id IS NOT DISTINCT FROM \(SELECT id FROM house\) DESC,\s+publishers\.is_built_in DESC,\s+LOWER\(publishers\.name\) ASC/
    )
    // the default project's linked publisher, NULL on artist sites
    expect(listQueryText()).toMatch(
      /SELECT p\.publisher_id AS id FROM projects p\s+WHERE p\.is_default_project/
    )
  })

  it('skips both on later pages, which continue by name', async () => {
    await fetchPublishersRaw(
      encodeCursor({
        name: 'Soap Library',
        id: publisherFixtureAlpha.id
      })
    )

    expect(listQueryText()).toContain('NOT publishers.is_built_in')
    expect(listQueryText()).toContain(
      'publishers.id IS DISTINCT FROM (SELECT id FROM house)'
    )
  })

  it('searches by name, type and url on both count and page queries', async () => {
    await fetchPublishersRaw(undefined, 'record')

    for (const call of mockSql.mock.calls.slice(0, 2)) {
      const text = (call[0] as unknown as string[]).join('?')
      expect(text).toContain('OR publishers.name ILIKE ?')
      expect(text).toContain('OR publishers.type ILIKE ?')
      expect(text).toContain('OR publishers.url ILIKE ?')
      expect(call).toContain('%record%')
    }
  })
})
