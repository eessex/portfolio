/**
 * @jest-environment node
 */
jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
jest.mock('@/lib/users/tokens', () => ({
  createResetToken: jest.fn()
}))

import { sql } from '@/lib/db'
import { USER_TOKEN_PATTERN } from '@/lib/users/schemas'
import { createResetToken } from '@/lib/users/tokens'

import { issueResetLink, normalizeBaseUrl } from './issue-reset-link'

const mockSql = jest.mocked(sql)
const mockCreateResetToken = jest.mocked(createResetToken)
const userId = '11111111-1111-1111-1111-111111111111'
const expiresAt = new Date('2026-11-04T12:00:00.000Z')

function mockUser() {
  mockSql.mockResolvedValueOnce([
    { id: userId, name: 'Eve', session_version: 3 }
  ] as never)
}

describe('#normalizeBaseUrl', () => {
  it('keeps only the origin', () => {
    expect(normalizeBaseUrl('https://site.com/')).toBe(
      'https://site.com'
    )
    expect(normalizeBaseUrl('https://site.com/login?x=1')).toBe(
      'https://site.com'
    )
  })

  it('refuses non-http addresses', () => {
    expect(normalizeBaseUrl('site.com')).toBeUndefined()
    expect(normalizeBaseUrl('javascript:alert(1)')).toBeUndefined()
  })
})

describe('#issueResetLink', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a reset token with the account as its own creator', async () => {
    mockUser()
    mockCreateResetToken.mockResolvedValue(expiresAt)

    const result = await issueResetLink(
      ' Eve@Example.com ',
      'https://site.com'
    )

    expect(mockSql.mock.calls[0]?.[0].join('')).toContain(
      'lower(email) = lower('
    )
    expect(mockSql.mock.calls[0]?.[1]).toBe('Eve@Example.com')
    expect(mockCreateResetToken).toHaveBeenCalledWith(
      userId,
      3,
      userId,
      expect.stringMatching(/^[0-9a-f]{64}$/)
    )
    if (!result.ok) throw new Error(result.message)
    expect(result.name).toBe('Eve')
    expect(result.expiresAt).toBe(expiresAt)
    const [base, token] = result.link.split('#')
    expect(base).toBe('https://site.com/reset-password')
    expect(token).toMatch(USER_TOKEN_PATTERN)
  })

  it('leaves a placeholder without a base url', async () => {
    mockUser()
    mockCreateResetToken.mockResolvedValue(expiresAt)

    const result = await issueResetLink('eve@example.com', undefined)

    expect(result.ok && result.link).toMatch(
      /^<your site>\/reset-password#/
    )
  })

  it('lists the admins for an unknown email', async () => {
    mockSql
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([
        { email: 'a@example.com' },
        { email: 'b@example.com' }
      ] as never)

    const result = await issueResetLink('x@example.com', undefined)

    expect(result).toEqual({
      ok: false,
      message:
        'No admin has the email x@example.com. Admins:\n  a@example.com\n  b@example.com'
    })
    expect(mockCreateResetToken).not.toHaveBeenCalled()
  })

  it('points to /setup when no admin exists', async () => {
    mockSql.mockResolvedValue([] as never)

    const result = await issueResetLink('x@example.com', undefined)

    expect(!result.ok && result.message).toContain('/setup')
  })

  it.each(['stale', 'gone'] as const)(
    'asks for a re-run when the account is %s',
    async (outcome) => {
      mockUser()
      mockCreateResetToken.mockResolvedValue(outcome)

      const result = await issueResetLink(
        'eve@example.com',
        undefined
      )

      expect(!result.ok && result.message).toContain(
        'Run the command again'
      )
    }
  )
})
