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

  it('lists the built-in publisher first', async () => {
    await fetchPublishersRaw()

    expect(listQueryText()).toMatch(
      /ORDER BY\s+publishers\.is_built_in DESC,\s+LOWER\(publishers\.name\) ASC/
    )
  })

  it('skips it on later pages, which continue by name', async () => {
    await fetchPublishersRaw(
      encodeCursor({
        name: 'Soap Library',
        id: publisherFixtureAlpha.id
      })
    )

    expect(listQueryText()).toContain('NOT publishers.is_built_in')
  })
})
