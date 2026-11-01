import bcrypt from 'bcrypt'

import { auth, signIn } from '@/auth'
import { isPasswordBreached } from '@/lib/auth/breached-password'
import {
  checkWindowLimit,
  clearFailedLogins,
  getClientIp,
  LOGIN_THROTTLED_CODE,
  registerLoginAttempt
} from '@/lib/auth/rate-limit'
import {
  findMatchingRecoveryCode,
  generateRecoveryCodeSet
} from '@/lib/auth/recovery-codes'
import { hashSetupCode } from '@/lib/auth/setup-code'
import { verifySetupCode } from '@/lib/auth/setup-code-check'
import {
  authenticate,
  changeEmail,
  changeName,
  changePassword,
  completeSetup,
  recoverAccount,
  regenerateRecoveryCodes
} from '@/lib/users/actions'
import { createFirstUser } from '@/lib/users/create'
import { fetchUserById, hasUsers } from '@/lib/users/data'
import {
  fetchUnusedRecoveryCodesByEmail,
  replaceRecoveryCodes,
  resetPasswordWithRecoveryCode
} from '@/lib/users/recovery-codes'
import {
  updateUserEmail,
  updateUserName,
  updateUserPassword
} from '@/lib/users/update'
import { formDataFromObject } from '@/test/helpers'

// signIn is a jest.fn() via the global @/auth mock in jest.setup.ts
const mockSignIn = signIn as unknown as jest.Mock

// Keep the neon client (pulled in via @/lib/auth/rate-limit) out of
// the jsdom environment.
jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

const CLIENT_IP = '203.0.113.1'

// completeSetup's own collaborators: mocked so its tests exercise only
// its orchestration (validate → IP limit → breach check → throttle → exists →
// code → create → sign in), not rate-limit's or setup-code's SQL.
jest.mock('@/lib/auth/rate-limit', () => ({
  LOGIN_THROTTLED_CODE: 'login-throttled',
  checkWindowLimit: jest.fn().mockResolvedValue(true),
  registerLoginAttempt: jest.fn().mockResolvedValue(0),
  clearFailedLogins: jest.fn(),
  getClientIp: jest.fn().mockResolvedValue('203.0.113.1')
}))
jest.mock('@/lib/auth/setup-code-check', () => ({
  verifySetupCode: jest.fn().mockResolvedValue('valid')
}))
jest.mock('@/lib/users/data', () => ({
  hasUsers: jest.fn().mockResolvedValue(false),
  fetchUserById: jest.fn()
}))
jest.mock('@/lib/users/update', () => ({
  updateUserEmail: jest.fn().mockResolvedValue('updated'),
  updateUserName: jest.fn(),
  updateUserPassword: jest.fn().mockResolvedValue(true)
}))
jest.mock('@/lib/auth/breached-password', () => ({
  isPasswordBreached: jest.fn().mockResolvedValue(false)
}))
jest.mock('@/lib/users/create', () => ({
  createFirstUser: jest.fn().mockResolvedValue(true)
}))
const recoveryCodeSet = {
  codes: ['AAAAA-AAAAA', 'BBBBB-BBBBB'],
  hashes: ['hash-a', 'hash-b']
}
jest.mock('@/lib/auth/recovery-codes', () => ({
  generateRecoveryCodeSet: jest.fn(),
  findMatchingRecoveryCode: jest.fn()
}))
jest.mock('@/lib/users/recovery-codes', () => ({
  fetchUnusedRecoveryCodesByEmail: jest.fn(),
  replaceRecoveryCodes: jest.fn(),
  resetPasswordWithRecoveryCode: jest.fn()
}))
jest
  .mocked(generateRecoveryCodeSet)
  .mockResolvedValue(recoveryCodeSet)

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
  password: 'a long enough setup passphrase',
  confirmPassword: 'a long enough setup passphrase'
}

describe('completeSetup', () => {
  beforeEach(() => jest.clearAllMocks())

  it('throttles repeated attempts before checking the account or code', async () => {
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

  it('limits attempts per IP before the breach lookup', async () => {
    jest.mocked(checkWindowLimit).mockResolvedValueOnce(false)

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res).toEqual({
      ok: false,
      message:
        'Too many attempts — please wait a moment and try again.'
    })
    expect(jest.mocked(checkWindowLimit)).toHaveBeenCalledWith(
      `setup:${CLIENT_IP}`,
      20,
      60 * 60
    )
    expect(jest.mocked(isPasswordBreached)).not.toHaveBeenCalled()
    expect(mockRegisterLoginAttempt).not.toHaveBeenCalled()
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

  it('validates the account fields without counting an attempt', async () => {
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
    expect(mockRegisterLoginAttempt).not.toHaveBeenCalled()
    expect(mockCreateFirstUser).not.toHaveBeenCalled()
  })

  it('holds the first password to the same length rule as changes', async () => {
    const res = await completeSetup(
      formDataFromObject({
        ...setupSubmission,
        password: 'super-secret',
        confirmPassword: 'super-secret'
      })
    )

    expect(res?.errors).toHaveProperty('password')
    expect(mockRegisterLoginAttempt).not.toHaveBeenCalled()
    expect(mockCreateFirstUser).not.toHaveBeenCalled()
  })

  it('rejects a breached password without counting an attempt', async () => {
    jest.mocked(isPasswordBreached).mockResolvedValueOnce(true)

    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(res?.errors).toEqual({
      password: [
        'This password has appeared in a data breach. Choose another.'
      ]
    })
    expect(mockRegisterLoginAttempt).not.toHaveBeenCalled()
    expect(mockCreateFirstUser).not.toHaveBeenCalled()
  })

  it('creates the account with recovery codes, clears the throttle, signs in and returns the codes', async () => {
    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(mockCreateFirstUser).toHaveBeenCalledWith({
      name: setupSubmission.name,
      email: setupSubmission.email,
      password: setupSubmission.password,
      codeHash: hashSetupCode(setupSubmission.code),
      recoveryCodeHashes: recoveryCodeSet.hashes
    })
    expect(mockClearFailedLogins).toHaveBeenCalledWith(
      `setup:${CLIENT_IP}`
    )
    // no redirect: the form shows the codes first
    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: setupSubmission.email,
      password: setupSubmission.password,
      redirect: false
    })
    expect(res).toEqual({
      ok: true,
      res: { recoveryCodes: recoveryCodeSet.codes }
    })
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
    const res = await completeSetup(
      formDataFromObject(setupSubmission)
    )

    expect(mockSignIn).toHaveBeenCalled()
    expect(res).toEqual({
      ok: true,
      res: { recoveryCodes: recoveryCodeSet.codes }
    })
  })

  it("rethrows Next's control-flow errors from sign-in", async () => {
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
        'Account created! Automatic sign-in failed — please log in at /login, then generate recovery codes on your dashboard.'
    })
  })
})

describe('recoverAccount', () => {
  const mockFetchCodes = jest.mocked(fetchUnusedRecoveryCodesByEmail)
  const mockFindMatch = jest.mocked(findMatchingRecoveryCode)
  const mockReset = jest.mocked(resetPasswordWithRecoveryCode)
  const mockIsPasswordBreached = jest.mocked(isPasswordBreached)
  const mockCheckWindowLimit = jest.mocked(checkWindowLimit)

  const userId = '11111111-1111-1111-1111-111111111111'
  const codeId = '22222222-2222-2222-2222-222222222222'
  const codes = [{ id: codeId, code_hash: 'hash' }]
  const submission = {
    email: 'ada@example.com',
    code: 'aaaaa-aaaaa',
    newPassword: 'a long enough new passphrase',
    confirmPassword: 'a long enough new passphrase'
  }
  const noMatch = {
    ok: false,
    message: "That email and recovery code don't match."
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchCodes.mockResolvedValue({ userId, codes })
    mockFindMatch.mockResolvedValue(codeId)
    mockReset.mockResolvedValue(true)
  })

  it('resets the password with the matching code, clears the throttle and signs in', async () => {
    const res = await recoverAccount(formDataFromObject(submission))

    expect(mockRegisterLoginAttempt).toHaveBeenCalledWith(
      submission.email
    )
    expect(mockFindMatch).toHaveBeenCalledWith(submission.code, codes)
    expect(mockReset).toHaveBeenCalledWith(
      userId,
      codeId,
      submission.newPassword
    )
    expect(mockClearFailedLogins).toHaveBeenCalledWith(
      submission.email
    )
    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: submission.email,
      password: submission.newPassword,
      redirectTo: '/dashboard'
    })
    expect(res).toEqual({ ok: true })
  })

  it('validates before touching the throttle', async () => {
    const res = await recoverAccount(
      formDataFromObject({ ...submission, newPassword: 'too short' })
    )

    expect(res?.ok).toBe(false)
    expect(res?.errors).toHaveProperty('newPassword')
    expect(mockRegisterLoginAttempt).not.toHaveBeenCalled()
  })

  it('refuses while throttled', async () => {
    mockRegisterLoginAttempt.mockResolvedValueOnce(30)

    const res = await recoverAccount(formDataFromObject(submission))

    expect(res).toEqual({
      ok: false,
      message:
        'Too many attempts — please wait a moment and try again.'
    })
    expect(mockFetchCodes).not.toHaveBeenCalled()
  })

  it('rejects a breached password before using up a code', async () => {
    mockIsPasswordBreached.mockResolvedValueOnce(true)

    const res = await recoverAccount(formDataFromObject(submission))

    expect(res?.errors).toEqual({
      newPassword: [
        'This password has appeared in a data breach. Choose another.'
      ]
    })
    expect(mockReset).not.toHaveBeenCalled()
    // so picking breached passwords can't lock the owner out
    expect(mockRegisterLoginAttempt).not.toHaveBeenCalled()
  })

  it('limits attempts per IP, whatever the email', async () => {
    mockCheckWindowLimit.mockResolvedValueOnce(false)

    const res = await recoverAccount(formDataFromObject(submission))

    expect(mockCheckWindowLimit).toHaveBeenCalledWith(
      `recover:${CLIENT_IP}`,
      expect.any(Number),
      expect.any(Number)
    )
    expect(res).toEqual({
      ok: false,
      message:
        'Too many attempts — please wait a moment and try again.'
    })
    expect(mockFindMatch).not.toHaveBeenCalled()
  })

  it('still compares codes for an unknown email, and answers the same as a wrong code', async () => {
    mockFetchCodes.mockResolvedValueOnce(null)
    mockFindMatch.mockResolvedValueOnce(null)

    const unknown = await recoverAccount(
      formDataFromObject(submission)
    )
    expect(mockFindMatch).toHaveBeenCalledWith(submission.code, [])

    mockFindMatch.mockResolvedValueOnce(null)
    const wrong = await recoverAccount(formDataFromObject(submission))

    expect(unknown).toEqual(noMatch)
    expect(wrong).toEqual(noMatch)
    expect(mockReset).not.toHaveBeenCalled()
    expect(mockClearFailedLogins).not.toHaveBeenCalled()
  })

  it('rejects a code a concurrent submit used first', async () => {
    mockReset.mockResolvedValueOnce(false)

    const res = await recoverAccount(formDataFromObject(submission))

    expect(res).toEqual(noMatch)
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('returns a graceful message when a DB call throws', async () => {
    mockFetchCodes.mockRejectedValueOnce(new Error('db exploded'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const res = await recoverAccount(formDataFromObject(submission))

    expect(res).toEqual({
      ok: false,
      message: 'Something went wrong — please try again.'
    })
  })

  it('points to /login when sign-in after the reset fails', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('connection refused'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const res = await recoverAccount(formDataFromObject(submission))

    expect(res).toEqual({
      ok: false,
      message: 'Password changed — please log in at /login.'
    })
  })

  // The code is already spent, so this mustn't read as a failure
  it('still signs in when clearing the throttle fails', async () => {
    mockClearFailedLogins.mockRejectedValueOnce(new Error('db blip'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const res = await recoverAccount(formDataFromObject(submission))

    expect(mockSignIn).toHaveBeenCalled()
    expect(res).toEqual({ ok: true })
  })
})

describe('account actions', () => {
  const mockAuth = auth as unknown as jest.Mock
  const mockFetchUserById = jest.mocked(fetchUserById)
  const mockIsPasswordBreached = jest.mocked(isPasswordBreached)
  const mockUpdateUserPassword = jest.mocked(updateUserPassword)
  const mockUpdateUserEmail = jest.mocked(updateUserEmail)
  const mockUpdateUserName = jest.mocked(updateUserName)

  const currentPassword = 'current-password'
  const newPassword = 'a long enough new passphrase'
  const user = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: bcrypt.hashSync(currentPassword, 4),
    session_version: 2
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue({
      user: { id: user.id, name: user.name, email: user.email }
    })
    mockFetchUserById.mockResolvedValue(user)
  })

  afterAll(() => {
    mockAuth.mockResolvedValue({
      user: { name: 'Test User', email: 'test@example.com' }
    })
  })

  describe('changePassword', () => {
    const fields = {
      currentPassword,
      newPassword,
      confirmPassword: newPassword
    }

    it('saves the new password and signs this device back in', async () => {
      const res = await changePassword(formDataFromObject(fields))

      expect(res).toEqual({ ok: true })
      expect(mockUpdateUserPassword).toHaveBeenCalledWith(
        user.id,
        newPassword,
        2
      )
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: user.email,
        password: newPassword,
        redirect: false
      })
      expect(mockClearFailedLogins).toHaveBeenCalledWith(user.email)
    })

    it('refuses without a session', async () => {
      mockAuth.mockResolvedValue(null)

      const res = await changePassword(formDataFromObject(fields))

      expect(res?.ok).toBe(false)
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it('rejects a wrong current password', async () => {
      const res = await changePassword(
        formDataFromObject({ ...fields, currentPassword: 'wrong' })
      )

      expect(res?.errors).toEqual({
        currentPassword: ['Incorrect password.']
      })
      expect(mockClearFailedLogins).not.toHaveBeenCalled()
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it('is throttled with login', async () => {
      mockRegisterLoginAttempt.mockResolvedValueOnce(8)

      const res = await changePassword(formDataFromObject(fields))

      expect(res?.message).toMatch(/too many attempts/i)
      expect(mockRegisterLoginAttempt).toHaveBeenCalledWith(
        user.email
      )
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it('rejects a short new password', async () => {
      const res = await changePassword(
        formDataFromObject({
          ...fields,
          newPassword: 'too-short',
          confirmPassword: 'too-short'
        })
      )

      expect(res?.errors).toHaveProperty('newPassword')
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it('counts emoji as one character each', async () => {
      // 8 emoji: 16 UTF-16 code units, 32 bytes, 8 characters
      const emoji = '🐙🦊🐝🦉🐢🦋🐳🦔'

      const res = await changePassword(
        formDataFromObject({
          ...fields,
          newPassword: emoji,
          confirmPassword: emoji
        })
      )

      expect(res?.errors).toHaveProperty('newPassword')
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it("rejects a password over bcrypt's 72 bytes", async () => {
      // 37 characters, 73 bytes: under the character limit
      const accented = `${'é'.repeat(36)}A`

      const res = await changePassword(
        formDataFromObject({
          ...fields,
          newPassword: accented,
          confirmPassword: accented
        })
      )

      expect(res?.errors).toHaveProperty('newPassword')
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it('rejects mismatched confirmation', async () => {
      const res = await changePassword(
        formDataFromObject({
          ...fields,
          confirmPassword: 'different'
        })
      )

      expect(res?.errors).toHaveProperty('confirmPassword')
    })

    it('rejects reusing the current password', async () => {
      const reused = 'the very same passphrase'
      mockFetchUserById.mockResolvedValue({
        ...user,
        password: bcrypt.hashSync(reused, 4)
      })

      const res = await changePassword(
        formDataFromObject({
          currentPassword: reused,
          newPassword: reused,
          confirmPassword: reused
        })
      )

      expect(res?.errors).toHaveProperty('newPassword')
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it("rejects a legacy password's 72-byte truncation", async () => {
      // 72 bytes, then a suffix bcrypt never reads
      const truncated = 'é'.repeat(36)
      const legacy = `${truncated}-legacy-suffix`
      mockFetchUserById.mockResolvedValue({
        ...user,
        password: bcrypt.hashSync(legacy, 4)
      })

      const res = await changePassword(
        formDataFromObject({
          currentPassword: legacy,
          newPassword: truncated,
          confirmPassword: truncated
        })
      )

      expect(res?.errors).toEqual({
        newPassword: [
          'Choose a password different from your current one.'
        ]
      })
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it('rejects a breached password', async () => {
      mockIsPasswordBreached.mockResolvedValueOnce(true)

      const res = await changePassword(formDataFromObject(fields))

      expect(res?.errors).toHaveProperty('newPassword')
      expect(mockUpdateUserPassword).not.toHaveBeenCalled()
    })

    it('refuses when the account changed after the password check', async () => {
      mockUpdateUserPassword.mockResolvedValueOnce(false)

      const res = await changePassword(formDataFromObject(fields))

      expect(res?.message).toMatch(/changed elsewhere/)
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('returns a form error when the save fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockUpdateUserPassword.mockRejectedValueOnce(new Error('db'))

      const res = await changePassword(formDataFromObject(fields))

      expect(res).toEqual({
        ok: false,
        message: 'Something went wrong — please try again.'
      })
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('says so when signing back in fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockSignIn.mockRejectedValueOnce(new Error('sign-in failed'))

      const res = await changePassword(formDataFromObject(fields))

      expect(res?.message).toMatch(/log in again/)
      expect(mockUpdateUserPassword).toHaveBeenCalled()
    })
  })

  describe('changeEmail', () => {
    const fields = { currentPassword, email: 'new@example.com' }

    it('saves the new email and signs this device back in', async () => {
      const res = await changeEmail(formDataFromObject(fields))

      expect(res).toEqual({ ok: true })
      expect(mockUpdateUserEmail).toHaveBeenCalledWith(
        user.id,
        'new@example.com',
        2
      )
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'new@example.com',
        password: currentPassword,
        redirect: false
      })
    })

    it('rejects a wrong current password', async () => {
      const res = await changeEmail(
        formDataFromObject({ ...fields, currentPassword: 'wrong' })
      )

      expect(res?.errors).toHaveProperty('currentPassword')
      expect(mockUpdateUserEmail).not.toHaveBeenCalled()
    })

    it('rejects an email another account uses', async () => {
      mockUpdateUserEmail.mockResolvedValueOnce('taken')

      const res = await changeEmail(formDataFromObject(fields))

      expect(res?.errors).toEqual({
        email: ['Another account already uses this email.']
      })
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('refuses when the account changed after the password check', async () => {
      mockUpdateUserEmail.mockResolvedValueOnce('stale')

      const res = await changeEmail(formDataFromObject(fields))

      expect(res?.message).toMatch(/changed elsewhere/)
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('rejects an unchanged email instead of reporting success', async () => {
      const res = await changeEmail(
        formDataFromObject({
          currentPassword: 'wrong',
          email: user.email
        })
      )

      expect(res).toEqual({
        ok: false,
        message: 'Failed to validate email.',
        errors: { email: ['This is already your email.'] }
      })
      expect(mockUpdateUserEmail).not.toHaveBeenCalled()
      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })

  describe('changeName', () => {
    it('saves the name without ending sessions', async () => {
      const res = await changeName(
        formDataFromObject({ name: 'Augusta Ada King' })
      )

      expect(res).toEqual({ ok: true })
      expect(mockUpdateUserName).toHaveBeenCalledWith(
        user.id,
        'Augusta Ada King'
      )
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('saves a name that reads like a checkbox value', async () => {
      const res = await changeName(formDataFromObject({ name: 'on' }))

      expect(res).toEqual({ ok: true })
      expect(mockUpdateUserName).toHaveBeenCalledWith(user.id, 'on')
    })

    it('rejects a blank name', async () => {
      const res = await changeName(formDataFromObject({ name: '' }))

      expect(res?.errors).toHaveProperty('name')
      expect(mockUpdateUserName).not.toHaveBeenCalled()
    })
  })

  describe('regenerateRecoveryCodes', () => {
    const mockReplace = jest.mocked(replaceRecoveryCodes)

    beforeEach(() => mockReplace.mockResolvedValue(true))

    it('replaces the set after checking the password and returns the codes', async () => {
      const res = await regenerateRecoveryCodes(
        formDataFromObject({ currentPassword })
      )

      expect(mockRegisterLoginAttempt).toHaveBeenCalledWith(
        user.email
      )
      expect(mockReplace).toHaveBeenCalledWith(
        user.id,
        user.session_version,
        recoveryCodeSet.hashes
      )
      expect(res).toEqual({
        ok: true,
        res: { recoveryCodes: recoveryCodeSet.codes }
      })
    })

    it('refuses when the account changed after the password check', async () => {
      mockReplace.mockResolvedValueOnce(false)

      const res = await regenerateRecoveryCodes(
        formDataFromObject({ currentPassword })
      )

      expect(res).toEqual({
        ok: false,
        message:
          'Your account was just changed elsewhere. Reload the page and try again.'
      })
    })

    it('rejects a wrong current password', async () => {
      const res = await regenerateRecoveryCodes(
        formDataFromObject({ currentPassword: 'wrong' })
      )

      expect(res?.errors).toEqual({
        currentPassword: ['Incorrect password.']
      })
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('requires a session', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const res = await regenerateRecoveryCodes(
        formDataFromObject({ currentPassword })
      )

      expect(res?.ok).toBe(false)
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('returns a graceful message when the swap fails', async () => {
      mockReplace.mockRejectedValueOnce(new Error('db exploded'))
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const res = await regenerateRecoveryCodes(
        formDataFromObject({ currentPassword })
      )

      expect(res).toEqual({
        ok: false,
        message: 'Something went wrong — please try again.'
      })
    })
  })
})
