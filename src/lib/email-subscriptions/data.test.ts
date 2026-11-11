import { sql } from '@/lib/db'
import {
  fetchEmailSubscriptionsPage,
  parsePageParam,
  RECENT_EXPORTS_LIMIT} from '@/lib/email-subscriptions/data'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
const mockSql = jest.mocked(sql)

const row = {
  id: '6a1f8c58-7d0c-4d8a-9c55-0d0e5b6f3a11',
  email: 'a@example.com',
  exported_at: null,
  is_spam: false,
  spam_reason: null,
  is_spam_reviewed: false,
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z')
}

describe('parsePageParam', () => {
  it.each([
    ['3', 3],
    [['2', '5'], 2],
    [undefined, 1],
    ['0', 1],
    ['-2', 1],
    ['1.5', 1],
    ['abc', 1]
  ])('%p → %p', (value, expected) => {
    expect(parsePageParam(value)).toBe(expected)
  })
})

describe('fetchEmailSubscriptionsPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('counts first, then fetches the page at its offset', async () => {
    mockSql
      .mockResolvedValueOnce([
        { total_count: 120, unexported_count: 7, spam_count: 2 }
      ])
      .mockResolvedValueOnce([row])
      .mockResolvedValueOnce([
        {
          id: '6a1f8c58-7d0c-4d8a-9c55-0d0e5b6f3a11',
          scope: 'new',
          subscriber_count: 3,
          created_at: '2026-11-01T12:00:00Z'
        }
      ])

    const res = await fetchEmailSubscriptionsPage(2)

    expect(res).toMatchObject({
      page: 2,
      pageCount: 3,
      totalCount: 120,
      unexportedCount: 7,
      spamCount: 2
    })
    expect(res.items[0]).toMatchObject({
      email: 'a@example.com',
      isSpam: false,
      exportedAt: undefined
    })
    // LIMIT, OFFSET
    expect(mockSql.mock.calls[1]?.slice(1)).toEqual([50, 50])
    expect(res.recentExports).toEqual([
      {
        id: '6a1f8c58-7d0c-4d8a-9c55-0d0e5b6f3a11',
        scope: 'new',
        subscriberCount: 3,
        createdAt: new Date('2026-11-01T12:00:00Z')
      }
    ])
    expect(mockSql.mock.calls[2]?.slice(1)).toEqual([
      RECENT_EXPORTS_LIMIT
    ])
  })

  it('clamps a page past the end to the last page', async () => {
    mockSql
      .mockResolvedValueOnce([
        { total_count: 60, unexported_count: 0, spam_count: 0 }
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const res = await fetchEmailSubscriptionsPage(9)

    expect(res.page).toBe(2)
    expect(mockSql.mock.calls[1]?.slice(1)).toEqual([50, 50])
  })

  it('has one empty page with no subscribers', async () => {
    mockSql
      .mockResolvedValueOnce([
        { total_count: 0, unexported_count: 0, spam_count: 0 }
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const res = await fetchEmailSubscriptionsPage(1)

    expect(res).toMatchObject({
      page: 1,
      pageCount: 1,
      items: [],
      recentExports: []
    })
  })

  it('wraps DB errors', async () => {
    mockSql.mockRejectedValueOnce(new Error('down'))
    await expect(fetchEmailSubscriptionsPage(1)).rejects.toThrow(
      'Failed to count subscribers.'
    )
  })
})
