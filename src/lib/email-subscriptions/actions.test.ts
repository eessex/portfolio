import { sql } from '@/lib/db'
import { createEmailSubscription } from '@/lib/email-subscriptions/actions'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

describe('createEmailSubscription', () => {
  beforeEach(() => jest.clearAllMocks())

  it('can create a subscription', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await createEmailSubscription(
      formDataFromObject({ email: 'test@example.com' })
    )

    expect(res).toEqual({
      ok: true,
      message: 'Successfully subscribed!'
    })
  })

  it('can handle validation errors without throwing', async () => {
    const res = await createEmailSubscription(
      formDataFromObject({ email: 'not-an-email' })
    )

    expect(res).toEqual({
      ok: false,
      errors: { email: ['Invalid email'] },
      message: 'Failed to validate email, try again.'
    })
  })

  it('can handle DB errors without throwing, surfacing the cause', async () => {
    mockSql.mockRejectedValueOnce(new Error('connection refused'))

    const res = await createEmailSubscription(
      formDataFromObject({ email: 'test@example.com' })
    )

    expect(res).toEqual({
      ok: false,
      message: 'Failed to create subscription: connection refused.'
    })
  })
})
