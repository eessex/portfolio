jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn()
}))

import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'
import { createFirstUser, createUser } from '@/lib/users/create'

const mockSql = jest.mocked(sql)
const mockHash = jest.mocked(bcrypt.hash)

const input = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'super-secret'
}

describe('#createUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('hashes the password and inserts the user', async () => {
    // @ts-expect-error bcrypt's overloaded hash() signature doesn't
    // narrow to the callback-less form jest.mocked() infers
    mockHash.mockResolvedValue('hashed-password')
    mockSql.mockResolvedValue([])

    await createUser(input)

    expect(mockHash).toHaveBeenCalledWith(input.password, 10)
    expect(mockSql).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('INSERT INTO users')
      ]),
      input.name,
      input.email,
      'hashed-password'
    )
  })

  it('does not return the inserted row', async () => {
    // @ts-expect-error see above
    mockHash.mockResolvedValue('hashed-password')
    mockSql.mockResolvedValue([
      { id: '1', ...input, password: 'hashed-password' }
    ])

    const result = await createUser(input)

    expect(result).toBeUndefined()
  })

  it('throws on DB error', async () => {
    // @ts-expect-error see above
    mockHash.mockResolvedValue('hashed-password')
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(createUser(input)).rejects.toThrow(
      'Failed to create user.'
    )
  })
})

describe('#createFirstUser', () => {
  const firstUserInput = {
    ...input,
    codeHash: 'a'.repeat(64),
    recoveryCodeHashes: ['code-hash-1', 'code-hash-2']
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('atomically consumes the setup code, inserts the recovery codes and reports it won', async () => {
    // @ts-expect-error see above
    mockHash.mockResolvedValue('hashed-password')
    mockSql.mockResolvedValue([{ id: '1' }])

    const result = await createFirstUser(firstUserInput)

    expect(result).toBe(true)
    expect(mockSql).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('DELETE FROM setup_code'),
        expect.stringContaining(
          'WHERE EXISTS (SELECT 1 FROM consumed)'
        ),
        expect.stringContaining(
          'AND NOT EXISTS (SELECT 1 FROM users)'
        ),
        expect.stringContaining('INSERT INTO user_recovery_codes')
      ]),
      firstUserInput.codeHash,
      firstUserInput.name,
      firstUserInput.email,
      'hashed-password',
      firstUserInput.recoveryCodeHashes
    )
  })

  it('reports a loss when the code was already consumed', async () => {
    // @ts-expect-error see above
    mockHash.mockResolvedValue('hashed-password')
    mockSql.mockResolvedValue([])

    expect(await createFirstUser(firstUserInput)).toBe(false)
  })

  it('throws on DB error', async () => {
    // @ts-expect-error see above
    mockHash.mockResolvedValue('hashed-password')
    mockSql.mockRejectedValue(new Error('db exploded'))

    await expect(createFirstUser(firstUserInput)).rejects.toThrow(
      'Failed to create first user.'
    )
  })
})
