jest.mock('@/lib/db', () => ({
  sql: Object.assign(jest.fn(), { transaction: jest.fn() })
}))

import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'
import {
  deleteUser,
  updateUserEmail,
  updateUserName,
  updateUserPassword
} from '@/lib/users/update'

const mockSql = jest.mocked(sql)
const id = '11111111-1111-1111-1111-111111111111'

function queryText(call = 0) {
  return mockSql.mock.calls[call]?.[0].join('')
}

describe('#updateUserPassword', () => {
  beforeEach(() => jest.clearAllMocks())

  it('stores a hash and bumps the session version', async () => {
    mockSql.mockResolvedValue([{ id }])

    expect(
      await updateUserPassword(id, 'a long enough new passphrase', 2)
    ).toBe(true)

    const hashed = mockSql.mock.calls[0]?.[1] as string
    expect(
      await bcrypt.compare('a long enough new passphrase', hashed)
    ).toBe(true)
    expect(queryText()).toContain(
      'session_version = session_version + 1'
    )
    expect(mockSql.mock.calls[0]?.[2]).toBe(id)
    expect(mockSql.mock.calls[0]?.[3]).toBe(2)
  })

  it('writes nothing when the account changed since the check', async () => {
    mockSql.mockResolvedValue([])

    expect(
      await updateUserPassword(id, 'a long enough new passphrase', 2)
    ).toBe(false)
    expect(queryText()).toContain('AND session_version = ')
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      updateUserPassword(id, 'whatever', 0)
    ).rejects.toThrow('Failed to update password.')
  })
})

describe('#updateUserEmail', () => {
  beforeEach(() => jest.clearAllMocks())

  it('saves the email and bumps the session version', async () => {
    mockSql.mockResolvedValue([{ id }])

    expect(await updateUserEmail(id, 'new@example.com', 2)).toBe(
      'updated'
    )
    expect(queryText()).toContain(
      'session_version = session_version + 1'
    )
    expect(mockSql.mock.calls[0]?.[1]).toBe('new@example.com')
    expect(mockSql.mock.calls[0]?.[3]).toBe(2)
  })

  it('writes nothing when the account changed since the check', async () => {
    mockSql.mockResolvedValue([])

    expect(await updateUserEmail(id, 'new@example.com', 2)).toBe(
      'stale'
    )
  })

  it.each(['idx_users_email', 'users_email_key'])(
    'returns taken when the email is taken (%s)',
    async (constraint) => {
      mockSql.mockRejectedValue(
        Object.assign(new Error('duplicate key'), {
          code: '23505',
          constraint
        })
      )

      expect(await updateUserEmail(id, 'taken@example.com', 0)).toBe(
        'taken'
      )
    }
  )

  it('throws on other DB errors', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(
      updateUserEmail(id, 'new@example.com', 0)
    ).rejects.toThrow('Failed to update email.')
  })
})

describe('#updateUserName', () => {
  beforeEach(() => jest.clearAllMocks())

  it('saves the name without touching the session version', async () => {
    mockSql.mockResolvedValue([])

    await updateUserName(id, 'Augusta Ada King')

    expect(mockSql.mock.calls[0]?.[1]).toBe('Augusta Ada King')
    expect(queryText()).not.toContain('session_version')
  })
})

describe('#deleteUser', () => {
  const mockTransaction = jest.mocked(sql.transaction)
  const actingId = '22222222-2222-2222-2222-222222222222'

  beforeEach(() => {
    jest.clearAllMocks()
    mockSql.mockImplementation(((strings: TemplateStringsArray) =>
      strings.join('')) as unknown as typeof sql)
  })

  it('locks every user, then deletes another admin while the acting one exists', async () => {
    mockTransaction.mockResolvedValue([[], [{ id }]])

    expect(await deleteUser(id, actingId, 2)).toBe('deleted')
    const [lock, del] = mockTransaction.mock
      .calls[0]?.[0] as unknown as string[]
    expect(lock).toContain('ORDER BY id FOR UPDATE')
    expect(del).toContain('DELETE FROM users')
    expect(del).toContain('AND id <>')
    expect(del).toContain('AND session_version =')
    expect(mockSql.mock.calls[1]?.slice(1)).toEqual([
      id,
      actingId,
      actingId,
      2
    ])
  })

  it('reports a target already gone', async () => {
    mockTransaction.mockResolvedValue([
      [{ id: actingId, session_version: 2 }],
      []
    ])

    expect(await deleteUser(id, actingId, 2)).toBe('gone')
  })

  it('reports an acting admin whose session version moved on', async () => {
    mockTransaction.mockResolvedValue([
      [{ id: actingId, session_version: 3 }],
      []
    ])

    expect(await deleteUser(id, actingId, 2)).toBe('stale')
  })

  it('throws on DB error', async () => {
    mockTransaction.mockRejectedValue(new Error('db exploded'))

    await expect(deleteUser(id, actingId, 2)).rejects.toThrow(
      'Failed to remove user.'
    )
  })
})
