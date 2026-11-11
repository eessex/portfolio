import { auth } from '@/auth'
import { sql } from '@/lib/db'
import {
  downloadSubscribersExport,
  exportEmailSubscriptions,
  flagSuspiciousSubscriptions,
  setEmailSubscriptionSpam
} from '@/lib/email-subscriptions/actions'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)
const mockAuth = auth as unknown as jest.Mock

const ID = '6a1f8c58-7d0c-4d8a-9c55-0d0e5b6f3a11'

describe('exportEmailSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'info').mockImplementation(() => {})
  })

  it('refuses without a session', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await exportEmailSubscriptions('all')
    expect(res?.ok).toBe(false)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('refuses an unknown scope', async () => {
    const res = await exportEmailSubscriptions(
      'everyone' as unknown as 'all'
    )
    expect(res?.ok).toBe(false)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('returns the CSV, filename and count', async () => {
    mockSql.mockResolvedValueOnce([
      { email: 'a@example.com', created_at: '2026-01-01T00:00:00Z' }
    ])
    const res = await exportEmailSubscriptions('new')
    expect(res).toMatchObject({
      ok: true,
      res: {
        count: 1,
        filename: expect.stringMatching(/^subscribers-new-.*\.csv$/),
        csv: expect.stringContaining('a@example.com')
      }
    })
  })

  it('returns DB errors without throwing', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockSql.mockRejectedValueOnce(new Error('down'))
    const res = await exportEmailSubscriptions('all')
    expect(res).toEqual({
      ok: false,
      message: 'Failed to export subscribers: down.'
    })
  })
})

describe('downloadSubscribersExport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'info').mockImplementation(() => {})
  })

  it('refuses without a session', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await downloadSubscribersExport(ID)
    expect(res?.ok).toBe(false)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('refuses an id that isn’t a uuid', async () => {
    const res = await downloadSubscribersExport('batch')
    expect(res?.ok).toBe(false)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('reports an unknown export', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await downloadSubscribersExport(ID)
    expect(res).toEqual({ ok: false, message: 'Export not found.' })
    expect(mockSql).toHaveBeenCalledTimes(1)
  })

  it('returns the batch’s CSV, named for its date', async () => {
    mockSql
      .mockResolvedValueOnce([{ created_at: '2026-11-01T12:00:00Z' }])
      .mockResolvedValueOnce([
        { email: 'a@example.com', created_at: '2026-01-01T00:00:00Z' }
      ])
    const res = await downloadSubscribersExport(ID)
    expect(res).toMatchObject({
      ok: true,
      res: {
        count: 1,
        filename: 'subscribers-new-2026-11-01.csv',
        csv: expect.stringContaining('a@example.com')
      }
    })
  })
})

describe('setEmailSubscriptionSpam', () => {
  beforeEach(() => jest.clearAllMocks())

  it('refuses without a session', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await setEmailSubscriptionSpam(ID, true)
    expect(res?.ok).toBe(false)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('refuses an invalid id', async () => {
    const res = await setEmailSubscriptionSpam('nope', true)
    expect(res?.ok).toBe(false)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('sets the flag', async () => {
    mockSql.mockResolvedValueOnce([{ id: ID }])
    const res = await setEmailSubscriptionSpam(ID, true)
    expect(res).toEqual({ ok: true, message: 'Marked as spam.' })
    expect(mockSql.mock.calls[0]?.slice(1)).toEqual([true, ID])
  })

  it('reports a missing subscriber', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await setEmailSubscriptionSpam(ID, false)
    expect(res).toEqual({
      ok: false,
      message: 'Subscriber not found.'
    })
  })
})

describe('flagSuspiciousSubscriptions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('refuses without a session', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await flagSuspiciousSubscriptions()
    expect(res?.ok).toBe(false)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('flags only the rows the rules match, with reasons', async () => {
    mockSql
      .mockResolvedValueOnce([
        { id: 'a', email: 'e.v.en.ud.ak.e.n29@gmail.com' },
        { id: 'b', email: 'real.person@gmail.com' },
        { id: 'c', email: 'Murray986.Schuster1995@sigismail.com' }
      ])
      .mockResolvedValueOnce([{ id: 'a' }, { id: 'c' }])

    const res = await flagSuspiciousSubscriptions()

    expect(res).toEqual({
      ok: true,
      res: { count: 2 },
      message: 'Flagged 2 as spam.'
    })
    expect(mockSql.mock.calls[1]?.slice(1)).toEqual([
      ['a', 'c'],
      ['gmail-dots', 'generated-name']
    ])
  })

  it('skips the update when nothing matches', async () => {
    mockSql.mockResolvedValueOnce([
      { id: 'b', email: 'real.person@gmail.com' }
    ])
    const res = await flagSuspiciousSubscriptions()
    expect(res).toMatchObject({ ok: true, res: { count: 0 } })
    expect(mockSql).toHaveBeenCalledTimes(1)
  })

  it('reads in batches, after the last id', async () => {
    const page = Array.from({ length: 1000 }, (_, i) => ({
      id: `id-${String(i).padStart(4, '0')}`,
      email: `person${i}@example.com`
    }))
    mockSql.mockResolvedValueOnce(page).mockResolvedValueOnce([])

    const res = await flagSuspiciousSubscriptions()

    expect(res).toMatchObject({ ok: true, res: { count: 0 } })
    expect(mockSql).toHaveBeenCalledTimes(2)
    expect(mockSql.mock.calls[1]).toContain('id-0999')
  })
})
