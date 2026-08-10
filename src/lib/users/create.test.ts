jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn()
}))

import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'
import { createUser } from '@/lib/users/create'

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
