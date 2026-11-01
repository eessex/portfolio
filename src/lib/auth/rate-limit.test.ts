import { headers } from 'next/headers'

import {
  checkWindowLimit,
  clearFailedLogins,
  getClientIp,
  registerLoginAttempt
} from '@/lib/auth/rate-limit'
import { sql } from '@/lib/db'

jest.mock('next/headers', () => ({
  headers: jest.fn()
}))
const mockHeaders = headers as unknown as jest.Mock

jest.mock('@/lib/db', () => ({
  sql: Object.assign(jest.fn(), { transaction: jest.fn() })
}))
const mockSql = jest.mocked(sql)
const mockTransaction = jest.mocked(sql.transaction)

describe('rate-limit', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('#registerLoginAttempt', () => {
    it('returns 0 when the database reports no wait', async () => {
      mockSql.mockResolvedValueOnce([{ wait: 0 }])
      expect(await registerLoginAttempt('user@example.com')).toBe(0)
    })

    it('returns the wait computed by the database', async () => {
      mockSql.mockResolvedValueOnce([{ wait: 42 }])
      expect(await registerLoginAttempt('user@example.com')).toBe(42)
    })

    it('normalizes the email to lowercase', async () => {
      mockSql.mockResolvedValueOnce([{ wait: 0 }])
      await registerLoginAttempt('User@Example.com')
      expect(mockSql.mock.calls[0]).toContain('user@example.com')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      await expect(
        registerLoginAttempt('user@example.com')
      ).rejects.toThrow('Failed to register login attempt.')
    })
  })

  describe('#checkWindowLimit', () => {
    it('allows attempts under the limit', async () => {
      mockTransaction.mockResolvedValueOnce([[], [{ allowed: true }]])
      expect(
        await checkWindowLimit('subscribe:1.2.3.4', 5, 3600)
      ).toBe(true)
    })

    it('rejects attempts over the limit', async () => {
      mockTransaction.mockResolvedValueOnce([
        [],
        [{ allowed: false }]
      ])
      expect(
        await checkWindowLimit('subscribe:1.2.3.4', 5, 3600)
      ).toBe(false)
    })

    // Concurrent requests mustn't all count under the limit
    it('locks the bucket before counting and recording', async () => {
      mockSql.mockImplementation(((strings: TemplateStringsArray) =>
        strings.join('')) as unknown as typeof sql)
      mockTransaction.mockResolvedValueOnce([[], [{ allowed: true }]])

      await checkWindowLimit('subscribe:1.2.3.4', 5, 3600)

      const queries = mockTransaction.mock
        .calls[0]?.[0] as unknown as string[]
      expect(queries[0]).toContain('pg_advisory_xact_lock')
      expect(mockSql.mock.calls[0]).toContain('subscribe:1.2.3.4')
      expect(queries[1]).toContain('INSERT INTO rate_limit_events')
    })

    it('can handle errors', async () => {
      mockTransaction.mockRejectedValueOnce(new Error('DB error'))
      await expect(
        checkWindowLimit('subscribe:1.2.3.4', 5, 3600)
      ).rejects.toThrow('Failed to check rate limit.')
    })
  })

  describe('#getClientIp', () => {
    it('returns the first x-forwarded-for entry', async () => {
      mockHeaders.mockResolvedValueOnce(
        new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
      )
      expect(await getClientIp()).toBe('1.2.3.4')
    })

    it('falls back to x-real-ip', async () => {
      mockHeaders.mockResolvedValueOnce(
        new Headers({ 'x-real-ip': '5.6.7.8' })
      )
      expect(await getClientIp()).toBe('5.6.7.8')
    })

    it('falls back to "unknown" without proxy headers', async () => {
      mockHeaders.mockResolvedValueOnce(new Headers())
      expect(await getClientIp()).toBe('unknown')
    })
  })

  describe('#clearFailedLogins', () => {
    it('clears attempts for the lowercased email', async () => {
      mockSql.mockResolvedValueOnce([])
      await clearFailedLogins('User@Example.com')
      expect(mockSql.mock.calls[0]).toContain('user@example.com')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      await expect(
        clearFailedLogins('user@example.com')
      ).rejects.toThrow('Failed to clear login attempts.')
    })
  })
})
