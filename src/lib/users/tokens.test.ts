jest.mock('@/lib/db', () => ({
  sql: Object.assign(jest.fn(), { transaction: jest.fn() })
}))

import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'
import {
  createInviteToken,
  createResetToken,
  deleteInvite,
  fetchPendingInvites,
  isUserTokenLive,
  resetPasswordWithToken
} from '@/lib/users/tokens'

const mockSql = jest.mocked(sql)
const mockTransaction = jest.mocked(sql.transaction)
const adminId = '11111111-1111-1111-1111-111111111111'
const userId = '22222222-2222-2222-2222-222222222222'
const expiresAt = '2026-11-04T12:00:00.000Z'

function queryText(call = 0) {
  return mockSql.mock.calls[call]?.[0].join('')
}

// Each query in a transaction is built by a sql`` call; return its
// text so the transaction mock can see what it was handed
function sqlReturnsText() {
  mockSql.mockImplementation(((strings: TemplateStringsArray) =>
    strings.join('')) as unknown as typeof sql)
}

describe('#createInviteToken', () => {
  beforeEach(() => jest.clearAllMocks())

  it('drops spent tokens and inserts an invite that expires', async () => {
    sqlReturnsText()
    mockTransaction.mockResolvedValue([
      [],
      [],
      [{ expires_at: expiresAt }]
    ])

    expect(await createInviteToken(adminId, 2, 'hash')).toEqual(
      new Date(expiresAt)
    )
    const [lock, spent, insert] = mockTransaction.mock
      .calls[0]?.[0] as unknown as string[]
    expect(lock).toContain('ORDER BY id')
    expect(lock).toContain('FOR UPDATE')
    expect(mockSql.mock.calls[0]?.[1]).toEqual([adminId])
    expect(spent).toContain(
      'used_at IS NOT NULL OR expires_at < now()'
    )
    expect(insert).toContain("'invite'")
    expect(insert).toContain('make_interval(hours =>')
    expect(insert).toContain('AND session_version =')
    expect(mockSql.mock.calls[2]).toEqual(
      expect.arrayContaining(['hash', adminId, 72, 2])
    )
  })

  it('inserts nothing for a creator whose session version moved on', async () => {
    mockTransaction.mockResolvedValue([[], [], []])

    expect(await createInviteToken(adminId, 2, 'hash')).toBe('stale')
  })

  it('throws on DB error', async () => {
    mockTransaction.mockRejectedValue(new Error('db exploded'))

    await expect(
      createInviteToken(adminId, 2, 'hash')
    ).rejects.toThrow('Failed to create invite.')
  })
})

describe('#createResetToken', () => {
  beforeEach(() => jest.clearAllMocks())

  it('replaces earlier reset links for the user', async () => {
    sqlReturnsText()
    mockTransaction.mockResolvedValue([
      [],
      [],
      [],
      [{ expires_at: expiresAt }]
    ])

    expect(
      await createResetToken(adminId, 2, userId, 'hash')
    ).toEqual(new Date(expiresAt))
    const [lock, , replaced, insert] = mockTransaction.mock
      .calls[0]?.[0] as unknown as string[]
    expect(lock).toContain('ORDER BY id')
    expect(lock).toContain('FOR UPDATE')
    expect(mockSql.mock.calls[0]?.[1]).toEqual([adminId, userId])
    expect(replaced).toContain("purpose = 'reset' AND user_id =")
    // Neither the old link's delete nor the insert lands for a stale
    // creator
    expect(replaced).toContain('AND session_version =')
    expect(insert).toContain('AND session_version =')
    // Binds the link to the target's current version
    expect(insert).toMatch(/expires_at,\s*session_version\)/)
  })

  it('reports a target who is gone', async () => {
    mockTransaction.mockResolvedValue([
      [{ id: adminId, session_version: 2 }],
      [],
      [],
      []
    ])

    expect(await createResetToken(adminId, 2, userId, 'hash')).toBe(
      'gone'
    )
  })

  it('reports a creator whose session version moved on', async () => {
    mockTransaction.mockResolvedValue([
      [
        { id: adminId, session_version: 3 },
        { id: userId, session_version: 0 }
      ],
      [],
      [],
      []
    ])

    expect(await createResetToken(adminId, 2, userId, 'hash')).toBe(
      'stale'
    )
  })
})

describe('#fetchPendingInvites', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns unused, unexpired invites with their creator', async () => {
    mockSql.mockResolvedValue([
      {
        id: 'invite-1',
        created_at: '2026-11-01T12:00:00.000Z',
        expires_at: expiresAt,
        created_by_name: 'Ada Lovelace'
      }
    ])

    expect(await fetchPendingInvites()).toEqual([
      {
        id: 'invite-1',
        createdAt: new Date('2026-11-01T12:00:00.000Z'),
        expiresAt: new Date(expiresAt),
        createdByName: 'Ada Lovelace'
      }
    ])
    expect(queryText()).toContain('t.used_at IS NULL')
    expect(queryText()).toContain('t.expires_at > now()')
  })
})

describe('#deleteInvite', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes only unused invites', async () => {
    mockSql.mockResolvedValue([{ id: 'invite-1' }])

    expect(await deleteInvite('invite-1')).toBe(true)
    expect(queryText()).toContain("purpose = 'invite'")
    expect(queryText()).toContain('used_at IS NULL')
    expect(mockSql.mock.calls[0]?.[1]).toBe('invite-1')
  })

  it('returns false when it was already used or revoked', async () => {
    mockSql.mockResolvedValue([])

    expect(await deleteInvite('invite-1')).toBe(false)
  })
})

describe('#isUserTokenLive', () => {
  beforeEach(() => jest.clearAllMocks())

  it('matches an unused, unexpired link of the purpose', async () => {
    mockSql.mockResolvedValue([{ '?column?': 1 }])

    expect(await isUserTokenLive('invite', 'hash')).toBe(true)
    expect(queryText()).toContain('used_at IS NULL')
    expect(queryText()).toContain('expires_at > now()')
    expect(queryText()).toContain(
      't.user_id IS NULL OR t.session_version = u.session_version'
    )
    expect(mockSql.mock.calls[0]).toEqual(
      expect.arrayContaining(['hash', 'invite'])
    )
  })

  it('returns false for a dead link', async () => {
    mockSql.mockResolvedValue([])

    expect(await isUserTokenLive('reset', 'hash')).toBe(false)
  })
})

describe('#resetPasswordWithToken', () => {
  beforeEach(() => jest.clearAllMocks())

  it('locks the user first, then spends the link and sets a hashed password with a session bump', async () => {
    sqlReturnsText()
    mockTransaction.mockResolvedValue([
      [{ id: userId }],
      [{ email: 'ada@example.com' }]
    ])

    expect(
      await resetPasswordWithToken('hash', 'a long new passphrase')
    ).toBe('ada@example.com')
    const [lock, reset] = mockTransaction.mock
      .calls[0]?.[0] as unknown as string[]
    expect(lock).toContain('FOR UPDATE OF u')
    expect(reset).toContain("purpose = 'reset'")
    expect(reset).toContain('t.session_version = u.session_version')
    expect(reset).toContain('expires_at > now()')
    expect(reset).toContain('session_version = session_version + 1')
    const hashed = mockSql.mock.calls[1]?.[2] as string
    expect(
      await bcrypt.compare('a long new passphrase', hashed)
    ).toBe(true)
  })

  it('returns null for an unknown, used or expired link', async () => {
    mockTransaction.mockResolvedValue([[], []])

    expect(await resetPasswordWithToken('hash', 'pw')).toBeNull()
  })

  it('throws on DB error', async () => {
    mockTransaction.mockRejectedValue(new Error('db exploded'))

    await expect(
      resetPasswordWithToken('hash', 'pw')
    ).rejects.toThrow('Failed to reset password.')
  })
})
