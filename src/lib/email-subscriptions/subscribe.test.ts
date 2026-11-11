import { checkWindowLimit } from '@/lib/auth/rate-limit'
import { sql } from '@/lib/db'
import { createEmailSubscription } from '@/lib/email-subscriptions/subscribe'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/auth/rate-limit', () => ({
  checkWindowLimit: jest.fn(async () => true),
  getClientIp: jest.fn(async () => '1.2.3.4')
}))
const mockCheckWindowLimit = jest.mocked(checkWindowLimit)

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

describe('createEmailSubscription', () => {
  beforeEach(() => jest.clearAllMocks())

  it('can create a subscription', async () => {
    mockSql.mockResolvedValueOnce([])
    const res = await createEmailSubscription(
      formDataFromObject({
        email: 'test@example.com',
        elapsed_ms: '5000'
      })
    )

    expect(res).toEqual({
      ok: true,
      message: 'Successfully subscribed!'
    })
  })

  it('can handle validation errors without throwing', async () => {
    const res = await createEmailSubscription(
      formDataFromObject({
        email: 'not-an-email',
        elapsed_ms: '5000'
      })
    )

    expect(res).toEqual({
      ok: false,
      errors: { email: ['Invalid email address'] },
      message: 'Failed to validate email, try again.'
    })
  })

  it('pretends success when the honeypot field is filled', async () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {})
    const res = await createEmailSubscription(
      formDataFromObject({
        email: 'bot@example.com',
        elapsed_ms: '5000',
        contact_preference: 'https://spam.example'
      })
    )

    expect(res).toEqual({
      ok: true,
      message: 'Successfully subscribed!'
    })
    expect(mockSql).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('subscribes anyway when the rate limit check fails', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockCheckWindowLimit.mockRejectedValueOnce(new Error('DB error'))
    mockSql.mockResolvedValueOnce([])

    const res = await createEmailSubscription(
      formDataFromObject({
        email: 'test@example.com',
        elapsed_ms: '5000'
      })
    )

    expect(res).toEqual({
      ok: true,
      message: 'Successfully subscribed!'
    })
    expect(mockSql).toHaveBeenCalledTimes(1)
    error.mockRestore()
  })

  it('rejects rate-limited callers without inserting', async () => {
    mockCheckWindowLimit.mockResolvedValueOnce(false)
    const res = await createEmailSubscription(
      formDataFromObject({
        email: 'test@example.com',
        elapsed_ms: '5000'
      })
    )

    expect(res).toEqual({
      ok: false,
      message: 'Too many attempts — please try again later.'
    })
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('can handle DB errors without throwing, surfacing the cause', async () => {
    mockSql.mockRejectedValueOnce(new Error('connection refused'))

    const res = await createEmailSubscription(
      formDataFromObject({
        email: 'test@example.com',
        elapsed_ms: '5000'
      })
    )

    expect(res).toEqual({
      ok: false,
      message: 'Failed to create subscription: connection refused.'
    })
  })

  it.each([
    ['too fast', { elapsed_ms: '300' }, {}],
    ['missing timing', {}, {}],
    ['BotID', { elapsed_ms: '5000' }, { isBot: true }]
  ])(
    'pretends success for %s without inserting',
    async (_, fields, options) => {
      const warn = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {})
      const res = await createEmailSubscription(
        formDataFromObject({ email: 'a@example.com', ...fields }),
        options
      )
      expect(res).toEqual({
        ok: true,
        message: 'Successfully subscribed!'
      })
      expect(mockSql).not.toHaveBeenCalled()
      warn.mockRestore()
    }
  )

  it('saves addresses the rules match, flagged as spam', async () => {
    mockSql.mockResolvedValueOnce([])
    await createEmailSubscription(
      formDataFromObject({
        email: 'w.enaje.p.u.ri29@gmail.com',
        elapsed_ms: '5000'
      })
    )
    expect(mockSql.mock.calls[0]?.slice(1)).toEqual([
      'w.enaje.p.u.ri29@gmail.com',
      true,
      'gmail-dots'
    ])
  })

  it('saves ordinary addresses unflagged', async () => {
    mockSql.mockResolvedValueOnce([])
    await createEmailSubscription(
      formDataFromObject({
        email: 'a@example.com',
        elapsed_ms: '5000'
      })
    )
    expect(mockSql.mock.calls[0]?.slice(1)).toEqual([
      'a@example.com',
      false,
      null
    ])
  })
})
