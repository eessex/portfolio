import { sql } from '@/lib/db'
import {
  fetchEmailSubscriptionsPage,
  parsePageParam
} from '@/lib/email-subscriptions/data'

jest.mock('@/lib/db', () => ({
  sql: Object.assign(jest.fn(), { transaction: jest.fn() })
}))
const mockSql = jest.mocked(sql)
const mockTransaction = jest.mocked(sql.transaction)

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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const counts = {
    unexported_count: 70,
    exported_count: 50,
    spam_count: 2
  }
  const query = () =>
    (mockSql.mock.calls[0]?.[0] as unknown as string[]).join('?')

  it('reads the counts and every page in one statement', async () => {
    const exportedAt = new Date('2026-11-01T12:00:00Z')
    mockSql.mockResolvedValueOnce([
      {
        ...counts,
        list_kind: 'exported',
        ...row,
        exported_at: exportedAt
      },
      { ...counts, list_kind: 'new', ...row },
      {
        ...counts,
        list_kind: 'spam',
        ...row,
        is_spam: true,
        spam_reason: 'gmail-dots'
      }
    ] as never)

    const res = await fetchEmailSubscriptionsPage({
      page: 2,
      exportedPage: 1,
      spamPage: 1
    })

    // one statement is one snapshot, so no transaction
    expect(mockSql).toHaveBeenCalledTimes(1)
    expect(mockTransaction).not.toHaveBeenCalled()
    expect(query()).toContain('count(*) FILTER')
    expect(res).toMatchObject({
      page: 2,
      pageCount: 2,
      activeCount: 120,
      unexportedCount: 70,
      exportedPage: 1,
      exportedPageCount: 1,
      exportedCount: 50,
      spamPage: 1,
      spamPageCount: 1,
      spamCount: 2
    })
    expect(res.items).toHaveLength(1)
    expect(res.items[0]).toMatchObject({
      email: 'a@example.com',
      isSpam: false,
      exportedAt: undefined
    })
    expect(res.exportedItems).toHaveLength(1)
    expect(res.exportedItems[0]).toMatchObject({ exportedAt })
    expect(res.spamItems).toHaveLength(1)
    expect(res.spamItems[0]).toMatchObject({
      isSpam: true,
      spamReason: 'gmail-dots'
    })
    // each requested page and the page size feed the clamps
    expect(mockSql.mock.calls[0]?.slice(1, 7)).toEqual([
      2, 50, 50, 1, 50, 50
    ])
  })

  it('clamps a page past the end in SQL and in the result', async () => {
    mockSql.mockResolvedValueOnce([
      { unexported_count: 60, exported_count: 60, spam_count: 60 }
    ] as never)

    const res = await fetchEmailSubscriptionsPage({
      page: 9,
      exportedPage: 9,
      spamPage: 9
    })

    expect(res.page).toBe(2)
    expect(res.exportedPage).toBe(2)
    expect(res.spamPage).toBe(2)
    // clamped before the int cast, so a huge page can't overflow
    expect(query().match(/GREATEST\(1, LEAST\(/g)).toHaveLength(3)
    expect(query().match(/\?::numeric,/g)).toHaveLength(3)
    expect(query()).not.toContain('?::int,')
    // each page's offset comes from the one counts read
    expect(query().match(/FROM email_subscriptions/g)).toHaveLength(4)
  })

  it('has one empty page with no subscribers', async () => {
    // the LEFT JOIN keeps a counts row with no page columns
    mockSql.mockResolvedValueOnce([
      {
        unexported_count: 0,
        exported_count: 0,
        spam_count: 0,
        list_kind: null,
        id: null
      }
    ] as never)

    const res = await fetchEmailSubscriptionsPage()

    expect(res).toMatchObject({
      page: 1,
      pageCount: 1,
      items: [],
      exportedItems: [],
      spamItems: []
    })
  })

  it('wraps DB errors', async () => {
    mockSql.mockRejectedValueOnce(new Error('down'))
    await expect(fetchEmailSubscriptionsPage()).rejects.toThrow(
      'Failed to fetch subscribers.'
    )
  })
})
