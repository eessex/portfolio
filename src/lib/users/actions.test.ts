import { signIn } from '@/auth'
import {
  clearFailedLogins,
  getClientIp,
  LOGIN_THROTTLED_CODE,
  registerLoginAttempt
} from '@/lib/auth/rate-limit'
import { hashSetupCode } from '@/lib/auth/setup-code'
import { verifySetupCode } from '@/lib/auth/setup-code-check'
import { authenticate, completeSetup } from '@/lib/users/actions'
import { createFirstUser } from '@/lib/users/create'
import { hasUsers } from '@/lib/users/data'
import { formDataFromObject } from '@/test/helpers'

// signIn is a jest.fn() via the global @/auth mock in jest.setup.ts
const mockSignIn = signIn as unknown as jest.Mock

// Keep the neon client (pulled in via @/lib/auth/rate-limit) out of
// the jsdom environment.
jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

const CLIENT_IP = '203.0.113.1'

// completeSetup's own collaborators: mocked so its tests exercise only
// its orchestration (throttle → exists → code → validate → create →
// sign in), not rate-limit's or setup-code's SQL.
jest.mock('@/lib/auth/rate-limit', () => ({
  LOGIN_THROTTLED_CODE: 'login-throttled',
  registerLoginAttempt: jest.fn().mockResolvedValue(0),
  clearFailedLogins: jest.fn(),
  getClientIp: jest.fn().mockResolvedValue('203.0.113.1')
}))
jest.mock('@/lib/auth/setup-code-check', () => ({
  verifySetupCode: jest.fn().mockResolvedValue('valid')
}))
jest.mock('@/lib/users/data', () => ({
  hasUsers: jest.fn().mockResolvedValue(false)
}))
jest.mock('@/lib/users/create', () => ({
  createFirstUser: jest.fn().mockResolvedValue(true)
}))

const mockRegisterLoginAttempt = jest.mocked(registerLoginAttempt)
const mockClearFailedLogins = jest.mocked(clearFailedLogins)
const mockGetClientIp = jest.mocked(getClientIp)
const mockVerifySetupCode = jest.mocked(verifySetupCode)
const mockHasUsers = jest.mocked(hasUsers)
const mockCreateFirstUser = jest.mocked(createFirstUser)

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

  it('keeps a same-origin redirectTo', async () => {
    const formData = formDataFromObject({
      ...credentials,
      redirectTo: '/events/new'
    })
    await authenticate(formData)

    expect(formData.get('redirectTo')).toBe('/events/new')
  })

  it('reduces an offsite redirectTo to a same-origin path', async () => {
    const formData = formDataFromObject({
      ...credentials,
      redirectTo: 'https://evil.example/steal'
    })
    await authenticate(formData)

    expect(formData.get('redirectTo')).toBe('/steal')
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

const setupSubmission = {
  code: 'K7QM-3XRD-PW9T-H2FC',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'super-secret',
  confirmPassword: 'super-secret'
}

describe('completeSetup', () => {
  beforeEach(() => jest.clearAllMocks())

  it('throttles repeated attempts before checking anything else', async () => {
    mockRegisterLoginAttempt.mockResolvedValueOnce(30)

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res).toEqual({
      ok: false,
      message:
        'Too many attempts — please wait a moment and try again.'
    })
    expect(mockHasUsers).not.toHaveBeenCalled()
  })

  it('throttles per client IP, not one shared bucket', async () => {
    await completeSetup(formDataFromObject(setupSubmission))

    expect(mockRegisterLoginAttempt).toHaveBeenCalledWith(
      `setup:${CLIENT_IP}`
    )

    mockGetClientIp.mockResolvedValueOnce('198.51.100.9')
    await completeSetup(formDataFromObject(setupSubmission))

    expect(mockRegisterLoginAttempt).toHaveBeenLastCalledWith(
      'setup:198.51.100.9'
    )
  })

  it('refuses once an account exists, before checking the code', async () => {
    mockHasUsers.mockResolvedValueOnce(true)

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res).toEqual({
      ok: false,
      message: 'An account already exists.'
    })
    expect(mockVerifySetupCode).not.toHaveBeenCalled()
  })

  it('rejects a wrong code', async () => {
    mockVerifySetupCode.mockResolvedValueOnce('wrong')

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res).toEqual({
      ok: false,
      message: "That code doesn't match."
    })
    expect(mockCreateFirstUser).not.toHaveBeenCalled()
  })

  it('rejects an expired code', async () => {
    mockVerifySetupCode.mockResolvedValueOnce('expired')

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res).toEqual({
      ok: false,
      message:
        'This code has expired. In Vercel, open Deployments and click Redeploy for a new one.'
    })
  })

  it('validates the account fields once the code checks out', async () => {
    const res = await completeSetup(
      formDataFromObject({
        ...setupSubmission,
        confirmPassword: 'does-not-match'
      })
    )

    expect(res?.ok).toBe(false)
    expect(res?.errors).toEqual({
      confirmPassword: ['Passwords must match.']
    })
    expect(mockCreateFirstUser).not.toHaveBeenCalled()
  })

  it('creates the account, clears the throttle, and signs in', async () => {
    const formData = formDataFromObject(setupSubmission)

    const res = await completeSetup(formData)

    expect(mockCreateFirstUser).toHaveBeenCalledWith({
      name: setupSubmission.name,
      email: setupSubmission.email,
      password: setupSubmission.password,
      codeHash: hashSetupCode(setupSubmission.code)
    })
    expect(mockClearFailedLogins).toHaveBeenCalledWith(
      `setup:${CLIENT_IP}`
    )
    expect(mockSignIn).toHaveBeenCalledWith('credentials', formData)
    expect(formData.get('redirectTo')).toBe('/dashboard')
    expect(res).toEqual({ ok: true })
  })

  it('returns a graceful message when a pre-creation DB call throws', async () => {
    mockHasUsers.mockRejectedValueOnce(
      new Error('connection refused')
    )
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res).toEqual({
      ok: false,
      message: 'Something went wrong — please try again.'
    })
    expect(mockCreateFirstUser).not.toHaveBeenCalled()
  })

  it('loses the create race to a simultaneous submit', async () => {
    mockCreateFirstUser.mockResolvedValueOnce(false)
    mockHasUsers
      .mockResolvedValueOnce(false) // the upfront check: no one yet
      .mockResolvedValueOnce(true) // re-check after losing: now there is

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res).toEqual({
      ok: false,
      message: 'An account already exists.'
    })
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('reports an expired code, not a false "account exists", when the race was lost to time', async () => {
    mockCreateFirstUser.mockResolvedValueOnce(false)
    mockHasUsers
      .mockResolvedValueOnce(false) // the upfront check
      .mockResolvedValueOnce(false) // re-check: still nobody — expired, not raced

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res).toEqual({
      ok: false,
      message:
        'This code has expired. In Vercel, open Deployments and click Redeploy for a new one.'
    })
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('signs in anyway when clearing the throttle fails', async () => {
    mockClearFailedLogins.mockRejectedValueOnce(
      new Error('connection refused')
    )
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const formData = formDataFromObject(setupSubmission)

    const res = await completeSetup(formData)

    expect(mockSignIn).toHaveBeenCalledWith('credentials', formData)
    expect(res).toEqual({ ok: true })
  })

  it('rethrows the redirect thrown by a successful sign-in', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/dashboard;307;'
    })
    mockSignIn.mockRejectedValueOnce(redirect)

    await expect(
      completeSetup(formDataFromObject(setupSubmission))
    ).rejects.toBe(redirect)
  })

  it('tells a created admin to log in when automatic sign-in fails', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('connection refused'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(mockCreateFirstUser).toHaveBeenCalled()
    expect(res).toEqual({
      ok: false,
      message:
        'Account created! Automatic sign-in failed — please log in at /login.'
    })
  })
})
