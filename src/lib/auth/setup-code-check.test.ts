import { hashSetupCode } from '@/lib/auth/setup-code'
import { verifySetupCode } from '@/lib/auth/setup-code-check'
import { sql } from '@/lib/db'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
const mockSql = jest.mocked(sql)

beforeEach(() => jest.clearAllMocks())

describe('verifySetupCode', () => {
  const CODE = 'K7QM-3XRD-PW9T-H2FC'

  it('is wrong when no code was ever generated', async () => {
    mockSql.mockResolvedValueOnce([])
    expect(await verifySetupCode(CODE)).toBe('wrong')
  })

  it('is expired before the hash is even checked', async () => {
    mockSql.mockResolvedValueOnce([
      {
        code_hash: 'not-the-real-hash',
        expires_at: new Date(Date.now() - 1000).toISOString()
      }
    ])
    expect(await verifySetupCode(CODE)).toBe('expired')
  })

  it('is valid when the normalized code matches the stored hash', async () => {
    mockSql.mockResolvedValueOnce([
      {
        code_hash: hashSetupCode(CODE),
        expires_at: new Date(Date.now() + 1000).toISOString()
      }
    ])
    expect(await verifySetupCode('k7qm 3xrd pw9t h2fc')).toBe('valid')
  })

  it('is wrong when the code does not match', async () => {
    mockSql.mockResolvedValueOnce([
      {
        code_hash: hashSetupCode(CODE),
        expires_at: new Date(Date.now() + 1000).toISOString()
      }
    ])
    expect(await verifySetupCode('K7QM-3XRD-PW9T-H2FD')).toBe('wrong')
  })
})
