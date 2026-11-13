'use server'

import bcrypt from 'bcrypt'
import { unstable_rethrow } from 'next/navigation'

import { signIn } from '@/auth'
import { isPasswordBreached } from '@/lib/auth/breached-password'
import { currentUserId, requireAuth } from '@/lib/auth/guard'
import { ACCOUNT_URL } from '@/lib/auth/paths'
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
import { safeRedirectPath } from '@/lib/auth/redirect'
import { hashSetupCode } from '@/lib/auth/setup-code'
import { verifySetupCode } from '@/lib/auth/setup-code-check'
import {
  generateUserToken,
  hashUserToken
} from '@/lib/auth/user-token'
import type { FormResponse } from '@/lib/types'
import {
  createFirstUser,
  createInvitedUser
} from '@/lib/users/create'
import { fetchUserById, hasUsers } from '@/lib/users/data'
import {
  fetchUnusedRecoveryCodesByEmail,
  replaceRecoveryCodes,
  resetPasswordWithRecoveryCode
} from '@/lib/users/recovery-codes'
import {
  acceptInviteSchema,
  changeEmailSchema,
  changeNameSchema,
  changePasswordSchema,
  completeSetupSchema,
  inviteUserSchema,
  otherUserSchema,
  recoverAccountSchema,
  regenerateRecoveryCodesSchema,
  resetPasswordSchema,
  revokeInviteSchema
} from '@/lib/users/schemas'
import {
  createInviteToken,
  createResetToken,
  deleteInvite,
  isUserTokenLive,
  resetPasswordWithToken
} from '@/lib/users/tokens'
import type { UserRow } from '@/lib/users/types'
import {
  deleteUser,
  updateUserEmail,
  updateUserName,
  updateUserPassword
} from '@/lib/users/update'
import {
  formatValidationResponse,
  normalizeFormData
} from '@/lib/util'

const THROTTLED_MESSAGE =
  'Too many attempts — please wait a moment and try again.'
const ACCOUNT_ERROR_MESSAGE =
  'Something went wrong — please try again.'
const BREACHED_PASSWORD_MESSAGE =
  'This password has appeared in a data breach. Choose another.'

async function breachedPasswordResponse(
  password: string,
  fieldName = 'newPassword'
): Promise<FormResponse<never> | null> {
  if (!(await isPasswordBreached(password))) return null
  return {
    ok: false,
    message: 'Failed to validate password.',
    errors: { [fieldName]: [BREACHED_PASSWORD_MESSAGE] }
  }
}

function signInErrorMessage(error: unknown): string | undefined {
  const { type, code } = (error ?? {}) as {
    type?: string
    code?: string
  }
  if (type === 'CredentialsSignin') {
    return code === LOGIN_THROTTLED_CODE
      ? THROTTLED_MESSAGE
      : 'Invalid credentials.'
  }
  // Any other AuthError — e.g. CallbackRouteError wrapping a DB
  // failure inside authorize() — fails closed with a clean message
  if (typeof type === 'string') {
    return 'Unable to log in — please try again.'
  }
  return undefined
}

/**
 * Deliberately public — unauthenticated visitors log in with it.
 */
export async function authenticate(
  formData: FormData
): Promise<FormResponse<Record<string, never>>> {
  formData.set(
    'redirectTo',
    safeRedirectPath(formData.get('redirectTo')?.toString())
  )

  try {
    await signIn('credentials', formData)
    return { ok: true }
  } catch (error) {
    // Successful sign-in redirects by throwing; let Next handle it.
    unstable_rethrow(error)
    const message = signInErrorMessage(error)
    if (message) return { ok: false, message }
    throw error
  }
}

/** Plain codes, shown once */
export type RecoveryCodesResponse = FormResponse<{
  recoveryCodes: string[]
}>

const ACCOUNT_EXISTS_MESSAGE = 'An account already exists.'
const CODE_EXPIRED_MESSAGE =
  'This code has expired. In Vercel, open Deployments and click Redeploy for a new one.'

const SETUP_IP_LIMIT = 20
const SETUP_IP_WINDOW_SECONDS = 60 * 60

/**
 * Deliberately public — no admin exists yet. Returns the recovery
 * codes for the form to show.
 */
export async function completeSetup(
  formData: FormData
): Promise<RecoveryCodesResponse> {
  // Keyed per IP (not a single shared bucket) so a stranger spamming
  // wrong codes throttles only themselves, never the owner trying
  // the real one from a different connection.
  const throttleKey = `setup:${await getClientIp()}`
  let outcome: 'created' | 'exists' | 'expired'
  let recoveryCodes: string[] = []

  const validated = completeSetupSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate account details.'
    )
  }
  const { name, email, password } = validated.data

  // Everything up to account creation is a plain DB read or the
  // atomic insert itself; an unexpected failure anywhere in here
  // (not the expected-outcome returns below, which aren't thrown)
  // would otherwise reject the action, and Next.js masks a thrown
  // server-action error to a generic message in production.
  try {
    // Bounds the breach lookups, which run before the code throttle
    const isWithinLimit = await checkWindowLimit(
      throttleKey,
      SETUP_IP_LIMIT,
      SETUP_IP_WINDOW_SECONDS
    )
    if (!isWithinLimit) {
      return { ok: false, message: THROTTLED_MESSAGE }
    }

    // Before the code throttle, so a rejected password doesn't count
    // as a failed attempt
    const breached = await breachedPasswordResponse(
      password,
      'password'
    )
    if (breached) return breached

    if ((await registerLoginAttempt(throttleKey)) > 0) {
      return { ok: false, message: THROTTLED_MESSAGE }
    }

    if (await hasUsers()) {
      return { ok: false, message: ACCOUNT_EXISTS_MESSAGE }
    }

    const submittedCode = String(formData.get('code') ?? '')
    const check = await verifySetupCode(submittedCode)
    if (check === 'wrong') {
      return { ok: false, message: "That code doesn't match." }
    }
    if (check === 'expired') {
      return { ok: false, message: CODE_EXPIRED_MESSAGE }
    }

    const recoveryCodeSet = await generateRecoveryCodeSet()
    recoveryCodes = recoveryCodeSet.codes
    // The verifySetupCode() check above is just for a friendly
    // message; this is what's actually race-safe (see
    // createFirstUser's own comment) — it also consumes the
    // setup_code row, so there's nothing left to delete afterward.
    const isCreated = await createFirstUser({
      name,
      email,
      password,
      codeHash: hashSetupCode(submittedCode),
      recoveryCodeHashes: recoveryCodeSet.hashes
    })
    if (isCreated) {
      outcome = 'created'
    } else {
      // A lost createFirstUser() race isn't always someone else's
      // submit — the code can also have expired in the gap between
      // verifySetupCode() above and the atomic insert. Re-check which
      // actually happened rather than assuming it was the former.
      outcome = (await hasUsers()) ? 'exists' : 'expired'
    }
  } catch (error) {
    console.error(
      'completeSetup: failed before account creation',
      error
    )
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }

  if (outcome === 'exists') {
    return { ok: false, message: ACCOUNT_EXISTS_MESSAGE }
  }
  if (outcome === 'expired') {
    return { ok: false, message: CODE_EXPIRED_MESSAGE }
  }

  // Best-effort: the account is already committed at this point, so a
  // throttle-table hiccup here must not strand the new admin without
  // a session — log it and sign them in anyway.
  try {
    await clearFailedLogins(throttleKey)
  } catch (error) {
    console.error('completeSetup: failed to clear throttle', error)
  }

  // No redirect: the form shows the recovery codes first
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false
    })
    return { ok: true, res: { recoveryCodes } }
  } catch (error) {
    unstable_rethrow(error)
    // The account exists and its setup code is already consumed, so
    // /setup won't work again — a plain rethrow here would make this
    // look like setup itself failed. Point them to /login instead.
    console.error(
      'completeSetup: sign-in after account creation failed',
      error
    )
    return {
      ok: false,
      message:
        'Account created! Automatic sign-in failed — please log in at /login, then generate recovery codes on your Account page.'
    }
  }
}

const RECOVERY_NO_MATCH_MESSAGE =
  "That email and recovery code don't match."
// Each attempt runs a full set of bcrypt compares
const RECOVERY_IP_LIMIT = 20
const RECOVERY_IP_WINDOW_SECONDS = 60 * 60

/** Deliberately public — for admins who can't log in. */
export async function recoverAccount(
  formData: FormData
): Promise<FormResponse<Record<string, never>>> {
  const validated = recoverAccountSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate account details.'
    )
  }
  const { email, code, newPassword } = validated.data

  try {
    // Per IP too, since the email throttle is dodged by varying it
    const isWithinLimit = await checkWindowLimit(
      `recover:${await getClientIp()}`,
      RECOVERY_IP_LIMIT,
      RECOVERY_IP_WINDOW_SECONDS
    )
    if (!isWithinLimit) {
      return { ok: false, message: THROTTLED_MESSAGE }
    }

    // Before the code check, so a rejected password doesn't use one
    // up or count as a failed attempt
    const breached = await breachedPasswordResponse(newPassword)
    if (breached) return breached

    if ((await registerLoginAttempt(email)) > 0) {
      return { ok: false, message: THROTTLED_MESSAGE }
    }

    const account = await fetchUnusedRecoveryCodesByEmail(email)
    const codeId = await findMatchingRecoveryCode(
      code,
      account?.codes ?? []
    )
    if (!account || !codeId) {
      return { ok: false, message: RECOVERY_NO_MATCH_MESSAGE }
    }

    const isReset = await resetPasswordWithRecoveryCode(
      account.userId,
      codeId,
      newPassword
    )
    // A concurrent submit used the same code first
    if (!isReset) {
      return { ok: false, message: RECOVERY_NO_MATCH_MESSAGE }
    }
  } catch (error) {
    console.error('recoverAccount failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }

  // Best-effort: the code is spent, so a failure here mustn't skip
  // the sign-in
  try {
    await clearFailedLogins(email)
  } catch (error) {
    console.error('recoverAccount: failed to clear throttle', error)
  }

  try {
    await signIn('credentials', {
      email,
      password: newPassword,
      redirectTo: ACCOUNT_URL
    })
    return { ok: true }
  } catch (error) {
    // Successful sign-in redirects by throwing; let Next handle it.
    unstable_rethrow(error)
    console.error('recoverAccount: sign-in after reset failed', error)
    return {
      ok: false,
      message: 'Password changed — please log in at /login.'
    }
  }
}

type AccountResponse = FormResponse<Record<string, never>>

// A valid session whose user row is gone
const SIGNED_OUT_RESPONSE = {
  ok: false,
  message: 'You must be signed in to perform this action.'
}
// Another change to the account landed after the password check
const STALE_RESPONSE = {
  ok: false,
  message:
    'Your account was just changed elsewhere. Reload the page and try again.'
}

async function signedInUser(): Promise<UserRow | null> {
  const id = await currentUserId()
  return id ? await fetchUserById(id) : null
}

/**
 * Shares the login throttle (keyed by email), so a stolen session
 * can't brute-force the password it doesn't know.
 */
async function checkCurrentPassword(
  user: UserRow,
  password: string
): Promise<FormResponse<never> | null> {
  if ((await registerLoginAttempt(user.email)) > 0) {
    return { ok: false, message: THROTTLED_MESSAGE }
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return {
      ok: false,
      message: 'Failed to verify your password.',
      errors: { currentPassword: ['Incorrect password.'] }
    }
  }
  await clearFailedLogins(user.email)
  return null
}

/**
 * The change bumped session_version, which ends this session too;
 * signing in again issues this device a current token.
 */
async function renewSession(
  email: string,
  password: string
): Promise<AccountResponse> {
  try {
    await signIn('credentials', { email, password, redirect: false })
    return { ok: true }
  } catch (error) {
    unstable_rethrow(error)
    console.error('renewSession: sign-in after change failed', error)
    return {
      ok: false,
      message: 'Saved, but you were signed out — please log in again.'
    }
  }
}

/** Ends the account's other sessions. */
export async function changePassword(
  formData: FormData
): Promise<AccountResponse> {
  const denied = await requireAuth()
  if (denied) return denied

  const validated = changePasswordSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate password.'
    )
  }
  const { currentPassword, newPassword } = validated.data

  let email: string
  try {
    const user = await signedInUser()
    if (!user) return SIGNED_OUT_RESPONSE
    const failed = await checkCurrentPassword(user, currentPassword)
    if (failed) return failed

    // bcrypt reads only the first 72 bytes, so a legacy password
    // longer than that still matches its own truncation
    if (await bcrypt.compare(newPassword, user.password)) {
      return {
        ok: false,
        message: 'Failed to validate password.',
        errors: {
          newPassword: [
            'Choose a password different from your current one.'
          ]
        }
      }
    }

    const breached = await breachedPasswordResponse(newPassword)
    if (breached) return breached

    const isUpdated = await updateUserPassword(
      user.id,
      newPassword,
      user.session_version
    )
    if (!isUpdated) return STALE_RESPONSE
    email = user.email
  } catch (error) {
    console.error('changePassword failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }

  return await renewSession(email, newPassword)
}

/** Ends the account's other sessions. */
export async function changeEmail(
  formData: FormData
): Promise<AccountResponse> {
  const denied = await requireAuth()
  if (denied) return denied

  const validated = changeEmailSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate email.'
    )
  }
  const { currentPassword, email } = validated.data

  try {
    const user = await signedInUser()
    if (!user) return SIGNED_OUT_RESPONSE
    if (email === user.email) {
      return {
        ok: false,
        message: 'Failed to validate email.',
        errors: { email: ['This is already your email.'] }
      }
    }

    const failed = await checkCurrentPassword(user, currentPassword)
    if (failed) return failed

    const outcome = await updateUserEmail(
      user.id,
      email,
      user.session_version
    )
    if (outcome === 'stale') return STALE_RESPONSE
    if (outcome === 'taken') {
      return {
        ok: false,
        message: 'Failed to validate email.',
        errors: {
          email: ['Another account already uses this email.']
        }
      }
    }
  } catch (error) {
    console.error('changeEmail failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }

  return await renewSession(email, currentPassword)
}

export async function changeName(
  formData: FormData
): Promise<AccountResponse> {
  const denied = await requireAuth()
  if (denied) return denied

  const validated = changeNameSchema.safeParse(
    Object.fromEntries(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate name.'
    )
  }

  try {
    const id = await currentUserId()
    if (!id) return SIGNED_OUT_RESPONSE
    await updateUserName(id, validated.data.name)
    return { ok: true }
  } catch (error) {
    console.error('changeName failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }
}

/** Replaces the account's recovery codes with a new set. */
export async function regenerateRecoveryCodes(
  formData: FormData
): Promise<RecoveryCodesResponse> {
  const denied = await requireAuth()
  if (denied) return denied

  const validated = regenerateRecoveryCodesSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate password.'
    )
  }

  try {
    const user = await signedInUser()
    if (!user) return SIGNED_OUT_RESPONSE
    const failed = await checkCurrentPassword(
      user,
      validated.data.currentPassword
    )
    if (failed) return failed

    const { codes, hashes } = await generateRecoveryCodeSet()
    const isReplaced = await replaceRecoveryCodes(
      user.id,
      user.session_version,
      hashes
    )
    if (!isReplaced) return STALE_RESPONSE
    return { ok: true, res: { recoveryCodes: codes } }
  } catch (error) {
    console.error('regenerateRecoveryCodes failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }
}

/** The plain token, shown once as a link, and when it expires */
export type UserLink = { token: string; expiresAt: string }
type UserLinkResponse = FormResponse<UserLink>

/** A one-time link that adds an admin. */
export async function inviteUser(
  formData: FormData
): Promise<UserLinkResponse> {
  const denied = await requireAuth()
  if (denied) return denied

  const validated = inviteUserSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate password.'
    )
  }

  try {
    const user = await signedInUser()
    if (!user) return SIGNED_OUT_RESPONSE
    const failed = await checkCurrentPassword(
      user,
      validated.data.currentPassword
    )
    if (failed) return failed

    const { token, hash } = generateUserToken()
    const expiresAt = await createInviteToken(
      user.id,
      user.session_version,
      hash
    )
    if (expiresAt === 'stale') return STALE_RESPONSE
    return {
      ok: true,
      res: { token, expiresAt: expiresAt.toISOString() }
    }
  } catch (error) {
    console.error('inviteUser failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }
}

const USER_GONE_MESSAGE = 'That admin was already removed.'

/**
 * A one-time link that sets another admin's password, replacing any
 * earlier one for them.
 */
export async function createResetLink(
  formData: FormData
): Promise<UserLinkResponse> {
  const denied = await requireAuth()
  if (denied) return denied

  const validated = otherUserSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate password.'
    )
  }
  const { currentPassword, userId } = validated.data

  try {
    const user = await signedInUser()
    if (!user) return SIGNED_OUT_RESPONSE
    if (userId === user.id) {
      return {
        ok: false,
        message:
          'Change your own password from your dashboard instead.'
      }
    }
    const failed = await checkCurrentPassword(user, currentPassword)
    if (failed) return failed

    const { token, hash } = generateUserToken()
    const expiresAt = await createResetToken(
      user.id,
      user.session_version,
      userId,
      hash
    )
    if (expiresAt === 'stale') return STALE_RESPONSE
    if (expiresAt === 'gone') {
      return { ok: false, message: USER_GONE_MESSAGE }
    }
    return {
      ok: true,
      res: { token, expiresAt: expiresAt.toISOString() }
    }
  } catch (error) {
    console.error('createResetLink failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }
}

/** Removes another admin and ends their sessions. */
export async function removeUser(
  formData: FormData
): Promise<AccountResponse> {
  const denied = await requireAuth()
  if (denied) return denied

  const validated = otherUserSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate password.'
    )
  }
  const { currentPassword, userId } = validated.data

  try {
    const user = await signedInUser()
    if (!user) return SIGNED_OUT_RESPONSE
    if (userId === user.id) {
      return { ok: false, message: 'You can’t remove yourself.' }
    }
    const failed = await checkCurrentPassword(user, currentPassword)
    if (failed) return failed

    const outcome = await deleteUser(
      userId,
      user.id,
      user.session_version
    )
    if (outcome === 'stale') return STALE_RESPONSE
    if (outcome === 'gone') {
      return { ok: false, message: USER_GONE_MESSAGE }
    }
    return { ok: true }
  } catch (error) {
    console.error('removeUser failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }
}

export async function revokeInvite(
  formData: FormData
): Promise<AccountResponse> {
  const denied = await requireAuth()
  if (denied) return denied

  const validated = revokeInviteSchema.safeParse(
    Object.fromEntries(formData)
  )
  if (!validated.success) {
    return { ok: false, message: 'Failed to revoke invite.' }
  }

  try {
    if (!(await deleteInvite(validated.data.inviteId))) {
      return {
        ok: false,
        message: 'That invite was already used or revoked.'
      }
    }
    return { ok: true }
  } catch (error) {
    console.error('revokeInvite failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }
}

const INVALID_LINK_MESSAGE =
  'This link has expired or was already used. Ask an admin for a new one.'
// Accepting runs a full recovery-code set of bcrypt hashes
const LINK_IP_LIMIT = 20
const LINK_IP_WINDOW_SECONDS = 60 * 60

// Breached check between the window limit and the failure backoff,
// so a rejected password isn't a failure
/** The throttle key to clear on success, or a response */
async function checkLinkAttempt(
  bucket: 'invite' | 'reset',
  password: string
): Promise<string | FormResponse<never>> {
  const throttleKey = `${bucket}:${await getClientIp()}`
  const isWithinLimit = await checkWindowLimit(
    throttleKey,
    LINK_IP_LIMIT,
    LINK_IP_WINDOW_SECONDS
  )
  if (!isWithinLimit) return { ok: false, message: THROTTLED_MESSAGE }

  const breached = await breachedPasswordResponse(password)
  if (breached) return breached

  if ((await registerLoginAttempt(throttleKey)) > 0) {
    return { ok: false, message: THROTTLED_MESSAGE }
  }
  return throttleKey
}

// Also the email's login backoff, or failed logins from before the
// new password would block its sign-in. Best-effort: the link is
// already spent, so this mustn't skip the sign-in.
async function clearLinkThrottles(
  throttleKey: string,
  email: string
) {
  try {
    await Promise.all([
      clearFailedLogins(throttleKey),
      clearFailedLogins(email)
    ])
  } catch (error) {
    console.error('Failed to clear link throttles', error)
  }
}

/**
 * Deliberately public, gated by the invite link's token. Returns the
 * new admin's recovery codes for the form to show.
 */
export async function acceptInvite(
  formData: FormData
): Promise<RecoveryCodesResponse> {
  const validated = acceptInviteSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate account details.'
    )
  }
  const { token, name, email, newPassword } = validated.data

  let recoveryCodes: string[]
  let throttleKey: string
  try {
    const attempt = await checkLinkAttempt('invite', newPassword)
    if (typeof attempt !== 'string') return attempt
    throttleKey = attempt

    const tokenHash = hashUserToken(token)
    if (!(await isUserTokenLive('invite', tokenHash))) {
      return { ok: false, message: INVALID_LINK_MESSAGE }
    }
    const recoveryCodeSet = await generateRecoveryCodeSet()
    recoveryCodes = recoveryCodeSet.codes
    const outcome = await createInvitedUser({
      name,
      email,
      password: newPassword,
      tokenHash,
      recoveryCodeHashes: recoveryCodeSet.hashes
    })
    if (outcome === 'invalid') {
      return { ok: false, message: INVALID_LINK_MESSAGE }
    }
    if (outcome === 'taken') {
      return {
        ok: false,
        message: 'Failed to validate email.',
        errors: {
          email: ['Another account already uses this email.']
        }
      }
    }
  } catch (error) {
    console.error('acceptInvite failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }

  await clearLinkThrottles(throttleKey, email)

  // No redirect: the form shows the recovery codes first
  try {
    await signIn('credentials', {
      email,
      password: newPassword,
      redirect: false
    })
    return { ok: true, res: { recoveryCodes } }
  } catch (error) {
    unstable_rethrow(error)
    console.error(
      'acceptInvite: sign-in after creation failed',
      error
    )
    return {
      ok: false,
      message:
        'Account created! Automatic sign-in failed — please log in at /login, then generate recovery codes on your Account page.'
    }
  }
}

/** Deliberately public, gated by the reset link's token. */
export async function resetPasswordWithLink(
  formData: FormData
): Promise<FormResponse<Record<string, never>>> {
  const validated = resetPasswordSchema.safeParse(
    normalizeFormData(formData)
  )
  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      'Failed to validate password.'
    )
  }
  const { token, newPassword } = validated.data

  let email: string
  let throttleKey: string
  try {
    const attempt = await checkLinkAttempt('reset', newPassword)
    if (typeof attempt !== 'string') return attempt
    throttleKey = attempt

    const tokenHash = hashUserToken(token)
    if (!(await isUserTokenLive('reset', tokenHash))) {
      return { ok: false, message: INVALID_LINK_MESSAGE }
    }
    const resetEmail = await resetPasswordWithToken(
      tokenHash,
      newPassword
    )
    if (!resetEmail) {
      return { ok: false, message: INVALID_LINK_MESSAGE }
    }
    email = resetEmail
  } catch (error) {
    console.error('resetPasswordWithLink failed', error)
    return { ok: false, message: ACCOUNT_ERROR_MESSAGE }
  }

  await clearLinkThrottles(throttleKey, email)

  try {
    await signIn('credentials', {
      email,
      password: newPassword,
      redirectTo: ACCOUNT_URL
    })
    return { ok: true }
  } catch (error) {
    // Successful sign-in redirects by throwing; let Next handle it.
    unstable_rethrow(error)
    console.error('resetPasswordWithLink: sign-in failed', error)
    return {
      ok: false,
      message: 'Password changed — please log in at /login.'
    }
  }
}
