import { sql } from '@/lib/db'
import {
  csvCell,
  exportFilename,
  selectAndStampExport,
  subscribersToCsv
} from '@/lib/email-subscriptions/export'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
const mockSql = jest.mocked(sql)

const queryText = (call = 0) =>
  (mockSql.mock.calls[call]?.[0] as unknown as string[]).join('?')

describe('csvCell', () => {
  it('leaves plain values alone', () => {
    expect(csvCell('a@example.com')).toBe('a@example.com')
  })

  it('quotes commas, quotes and line breaks', () => {
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('a\nb')).toBe('"a\nb"')
  })

  it.each(['=1+1', '+1', '-1', '@SUM(A1)', '\tx'])(
    'guards formula-like %p',
    (value) => {
      expect(csvCell(value).replace(/^"/, '')).toMatch(/^'/)
    }
  )
})

describe('subscribersToCsv', () => {
  it('writes a BOM, header and rows oldest first', () => {
    const csv = subscribersToCsv([
      {
        email: 'b@example.com',
        created_at: '2026-02-01T00:00:00Z'
      },
      {
        email: 'a@example.com',
        created_at: new Date('2026-01-01T00:00:00Z')
      }
    ])
    expect(csv).toBe(
      '\uFEFFemail,subscribed_at\r\n' +
        'a@example.com,2026-01-01T00:00:00.000Z\r\n' +
        'b@example.com,2026-02-01T00:00:00.000Z\r\n'
    )
  })

  it('writes just the header for no rows', () => {
    expect(subscribersToCsv([])).toBe('\uFEFFemail,subscribed_at\r\n')
  })
})

describe('exportFilename', () => {
  it('names the scope and date', () => {
    expect(
      exportFilename('new', new Date('2026-11-10T12:00:00Z'))
    ).toBe('subscribers-new-2026-11-10.csv')
  })
})

describe('selectAndStampExport', () => {
  const exportId = '00000000-0000-4000-8000-000000000001'

  beforeEach(() => jest.clearAllMocks())

  it.each(['all', 'new'] as const)(
    'scope %p stamps, records and returns in one statement',
    async (scope) => {
      mockSql.mockResolvedValueOnce([])
      await selectAndStampExport(scope, exportId)
      expect(mockSql).toHaveBeenCalledTimes(1)
      const text = queryText()
      expect(text).toContain('SET exported_at = current_timestamp')
      expect(text).toContain('NOT is_spam')
      expect(text).toContain('INSERT INTO email_subscription_exports')
      expect(text).toContain('HAVING count(*) > 0')
      expect(mockSql.mock.calls[0]).toContain(exportId)
      expect(mockSql.mock.calls[0]).toContain(scope)
    }
  )

  it('limits new to unexported rows, all to every one', async () => {
    mockSql.mockResolvedValueOnce([])
    await selectAndStampExport('new', exportId)
    expect(queryText()).toContain(
      "AND (? = 'all' OR exported_at IS NULL)"
    )
  })

  it('no longer tags rows with a batch', async () => {
    mockSql.mockResolvedValueOnce([])
    await selectAndStampExport('new', exportId)
    expect(queryText()).not.toContain('export_batch_id')
  })
})
