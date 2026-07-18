import { signIn } from '@/auth'
import { LOGIN_THROTTLED_CODE } from '@/lib/auth/rate-limit'
import { authenticate } from '@/lib/users/actions'
import { formDataFromObject } from '@/test/helpers'

// signIn is a jest.fn() via the global @/auth mock in jest.setup.ts
const mockSignIn = signIn as unknown as jest.Mock

// Keep the neon client (pulled in via @/lib/auth/rate-limit) out of
// the jsdom environment.
jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

// Shaped like next-auth's CredentialsSignin, which authenticate
// matches structurally (see src/lib/users/actions.ts).
class FakeCredentialsSignin extends Error {
  type = 'CredentialsSignin'
  code = 'credentials'
}

const credentials = {
  email: 'fake@example.com',
  password: 'supersecret'
}

describe('authenticate', () => {
  beforeEach(() => jest.clearAllMocks())

  it('signs in with the submitted form data', async () => {
    const formData = formDataFromObject(credentials)
    const res = await authenticate(formData)

    expect(res).toEqual({ ok: true })
    expect(mockSignIn).toHaveBeenCalledWith('credentials', formData)
  })

  it('maps credential errors to a form response', async () => {
    mockSignIn.mockRejectedValueOnce(new FakeCredentialsSignin())

    const res = await authenticate(formDataFromObject(credentials))

    expect(res).toEqual({
      ok: false,
      message: 'Invalid credentials.'
    })
  })

  it('maps throttled logins to a distinct message', async () => {
    const throttled = new FakeCredentialsSignin()
    throttled.code = LOGIN_THROTTLED_CODE
    mockSignIn.mockRejectedValueOnce(throttled)

    const res = await authenticate(formDataFromObject(credentials))

    expect(res).toEqual({
      ok: false,
      message:
        'Too many attempts — please wait a moment and try again.'
    })
  })

  it('maps other auth errors to a generic message', async () => {
    // Shaped like the CallbackRouteError next-auth wraps around
    // errors thrown inside authorize(), e.g. a DB failure.
    const wrapped = Object.assign(
      new Error('Read more at https://errors.authjs.dev'),
      { type: 'CallbackRouteError' }
    )
    mockSignIn.mockRejectedValueOnce(wrapped)

    const res = await authenticate(formDataFromObject(credentials))

    expect(res).toEqual({
      ok: false,
      message: 'Unable to log in — please try again.'
    })
  })

  it('rethrows the redirect thrown by a successful sign-in', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/;307;'
    })
    mockSignIn.mockRejectedValueOnce(redirect)

    await expect(
      authenticate(formDataFromObject(credentials))
    ).rejects.toBe(redirect)
  })

  it('rethrows unknown errors', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('connection refused'))

    await expect(
      authenticate(formDataFromObject(credentials))
    ).rejects.toThrow('connection refused')
  })
})
