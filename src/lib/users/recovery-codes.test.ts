jest.mock('@/lib/db', () => ({
  sql: Object.assign(jest.fn(), { transaction: jest.fn() })
}))

import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'
import {
  countUnusedRecoveryCodes,
  fetchUnusedRecoveryCodesByEmail,
  replaceRecoveryCodes,
  resetPasswordWithRecoveryCode
} from '@/lib/users/recovery-codes'

const mockSql = jest.mocked(sql)
const mockTransaction = jest.mocked(sql.transaction)
const userId = '11111111-1111-1111-1111-111111111111'
const codeId = '22222222-2222-2222-2222-222222222222'

function queryText(call = 0) {
  return mockSql.mock.calls[call]?.[0].join('')
}

describe('#fetchUnusedRecoveryCodesByEmail', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns the account and its unused codes', async () => {
    mockSql.mockResolvedValue([
      { user_id: userId, id: codeId, code_hash: 'hash' }
    ])

    expect(
      await fetchUnusedRecoveryCodesByEmail('ada@example.com')
    ).toEqual({ userId, codes: [{ id: codeId, code_hash: 'hash' }] })
    expect(queryText()).toContain('c.used_at IS NULL')
  })

  it('returns an account with no codes left', async () => {
    mockSql.mockResolvedValue([
      { user_id: userId, id: null, code_hash: null }
    ])

    expect(
      await fetchUnusedRecoveryCodesByEmail('ada@example.com')
    ).toEqual({ userId, codes: [] })
  })

  it('returns null for an unknown email', async () => {
    mockSql.mockResolvedValue([])

    expect(
      await fetchUnusedRecoveryCodesByEmail('nobody@example.com')
    ).toBeNull()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      fetchUnusedRecoveryCodesByEmail('ada@example.com')
    ).rejects.toThrow('Failed to fetch recovery codes.')
  })
})

describe('#countUnusedRecoveryCodes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('counts the unused codes', async () => {
    mockSql.mockResolvedValue([{ count: 5 }])

    expect(await countUnusedRecoveryCodes(userId)).toBe(5)
    expect(queryText()).toContain('used_at IS NULL')
  })
})

describe('#replaceRecoveryCodes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('locks the user, deletes the old set and inserts the new one in a transaction', async () => {
    mockSql.mockImplementation(((strings: TemplateStringsArray) =>
      strings.join('')) as unknown as typeof sql)
    mockTransaction.mockResolvedValue([[{ session_version: 3 }]])

    expect(await replaceRecoveryCodes(userId, 3, ['a', 'b'])).toBe(
      true
    )

    const queries = mockTransaction.mock
      .calls[0]?.[0] as unknown as string[]
    expect(queries[0]).toContain('FOR UPDATE')
    expect(queries[1]).toContain('DELETE FROM user_recovery_codes')
    expect(queries[2]).toContain('INSERT INTO user_recovery_codes')
    expect(mockSql.mock.calls[2]?.[2]).toEqual(['a', 'b'])
  })

  // A password/email change committed after the caller's check
  it('writes nothing and reports a stale session version', async () => {
    mockSql.mockImplementation(((strings: TemplateStringsArray) =>
      strings.join('')) as unknown as typeof sql)
    mockTransaction.mockResolvedValue([[{ session_version: 4 }]])

    expect(await replaceRecoveryCodes(userId, 3, ['a'])).toBe(false)

    const queries = mockTransaction.mock
      .calls[0]?.[0] as unknown as string[]
    expect(queries[1]).toContain('session_version = ')
    expect(queries[2]).toContain('session_version = ')
    expect(mockSql.mock.calls[1]?.[3]).toBe(3)
    expect(mockSql.mock.calls[2]?.[4]).toBe(3)
  })

  it('throws on DB error', async () => {
    mockTransaction.mockRejectedValue(new Error('db exploded'))

    await expect(replaceRecoveryCodes(userId, 0, [])).rejects.toThrow(
      'Failed to replace recovery codes.'
    )
  })
})

describe('#resetPasswordWithRecoveryCode', () => {
  beforeEach(() => jest.clearAllMocks())

  it('locks the user, then uses up the code, stores a hash and bumps the session version', async () => {
    mockSql.mockImplementation(((strings: TemplateStringsArray) =>
      strings.join('')) as unknown as typeof sql)
    mockTransaction.mockResolvedValue([[], [{ id: userId }]])

    expect(
      await resetPasswordWithRecoveryCode(
        userId,
        codeId,
        'a long enough new passphrase'
      )
    ).toBe(true)

    // Same lock order as replaceRecoveryCodes
    expect(queryText(0)).toContain('FROM users')
    expect(queryText(0)).toContain('FOR UPDATE')
    expect(queryText(1)).toContain('used_at IS NULL')
    expect(queryText(1)).toContain(
      'session_version = session_version + 1'
    )
    const hashed = mockSql.mock.calls[1]?.[3] as string
    expect(
      await bcrypt.compare('a long enough new passphrase', hashed)
    ).toBe(true)
  })

  it('reports a code already used', async () => {
    mockTransaction.mockResolvedValue([[], []])

    expect(
      await resetPasswordWithRecoveryCode(userId, codeId, 'whatever')
    ).toBe(false)
  })

  it('throws on DB error', async () => {
    mockTransaction.mockRejectedValue(new Error('db exploded'))

    await expect(
      resetPasswordWithRecoveryCode(userId, codeId, 'whatever')
    ).rejects.toThrow('Failed to reset password.')
  })
})
