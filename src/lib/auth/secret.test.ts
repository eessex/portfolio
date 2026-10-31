import type { authSecret as AuthSecret } from '@/lib/auth/secret'
import { sql } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

// Fresh module per test: the stored secret is memoized
async function loadAuthSecret() {
  let authSecret: typeof AuthSecret | undefined
  await jest.isolateModulesAsync(async () => {
    ;({ authSecret } = await import('@/lib/auth/secret'))
  })
  return authSecret!
}

describe('authSecret', () => {
  const originalSecret = process.env.AUTH_SECRET

  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.AUTH_SECRET
  })

  afterAll(() => {
    process.env.AUTH_SECRET = originalSecret
  })

  it('prefers AUTH_SECRET without reading the database', async () => {
    process.env.AUTH_SECRET = 'from-env'
    const authSecret = await loadAuthSecret()

    expect(await authSecret()).toBe('from-env')
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('reads the generated secret once and reuses it', async () => {
    mockSql.mockResolvedValueOnce([{ value: 'from-db' }])
    const authSecret = await loadAuthSecret()

    expect(await authSecret()).toBe('from-db')
    expect(await authSecret()).toBe('from-db')
    expect(mockSql).toHaveBeenCalledTimes(1)
  })

  it('throws when there is no secret anywhere', async () => {
    mockSql.mockResolvedValueOnce([])
    const authSecret = await loadAuthSecret()

    await expect(authSecret()).rejects.toThrow('No auth secret')
  })

  it('retries after a failed read instead of caching it', async () => {
    mockSql
      .mockRejectedValueOnce(new Error('connection reset'))
      .mockResolvedValueOnce([{ value: 'from-db' }])
    const authSecret = await loadAuthSecret()

    await expect(authSecret()).rejects.toThrow('connection reset')
    expect(await authSecret()).toBe('from-db')
  })
})
