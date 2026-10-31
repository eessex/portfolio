jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

import { sql } from '@/lib/db'
import {
  countUsers,
  fetchSessionVersion,
  fetchUserByEmail,
  hasUsers,
  recordLogin
} from '@/lib/users/data'

const mockSql = jest.mocked(sql)

const userRow = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'hashed-password',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

describe('#fetchUserByEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the user when found', async () => {
    mockSql.mockResolvedValue([userRow])

    const result = await fetchUserByEmail(userRow.email)

    expect(result).toEqual(userRow)
  })

  it('returns null when not found', async () => {
    mockSql.mockResolvedValue([])

    const result = await fetchUserByEmail('missing@example.com')

    expect(result).toBeNull()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(fetchUserByEmail(userRow.email)).rejects.toThrow(
      'Failed to fetch user.'
    )
  })
})

describe('#recordLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stamps last_login_at and returns the session version', async () => {
    mockSql.mockResolvedValue([{ session_version: 2 }])

    expect(await recordLogin(userRow.id)).toBe(2)
    expect(mockSql.mock.calls[0]?.[0].join('')).toContain(
      'last_login_at = now()'
    )
    expect(mockSql.mock.calls[0]?.[1]).toBe(userRow.id)
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(recordLogin(userRow.id)).rejects.toThrow(
      'Failed to record login.'
    )
  })
})

describe('#fetchSessionVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the session version', async () => {
    mockSql.mockResolvedValue([{ session_version: 0 }])

    expect(await fetchSessionVersion(userRow.id)).toBe(0)
  })

  it('returns null when the user is gone', async () => {
    mockSql.mockResolvedValue([])

    expect(await fetchSessionVersion(userRow.id)).toBeNull()
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(fetchSessionVersion(userRow.id)).rejects.toThrow(
      'Failed to fetch session version.'
    )
  })
})

describe('#countUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the user count', async () => {
    mockSql.mockResolvedValue([{ count: 3 }])

    const result = await countUsers()

    expect(result).toBe(3)
  })

  it('returns 0 when the row is missing', async () => {
    mockSql.mockResolvedValue([])

    const result = await countUsers()

    expect(result).toBe(0)
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(countUsers()).rejects.toThrow(
      'Failed to count users.'
    )
  })
})

describe('#hasUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns true when a user exists', async () => {
    mockSql.mockResolvedValue([{ exists: true }])

    expect(await hasUsers()).toBe(true)
  })

  it('returns false when none exist', async () => {
    mockSql.mockResolvedValue([{ exists: false }])

    expect(await hasUsers()).toBe(false)
  })

  it('throws on DB error', async () => {
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(hasUsers()).rejects.toThrow('Failed to check users.')
  })
})
