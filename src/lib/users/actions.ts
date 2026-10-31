'use server'

import bcrypt from 'bcrypt'
import { unstable_rethrow } from 'next/navigation'

import { signIn } from '@/auth'
import { isPasswordBreached } from '@/lib/auth/breached-password'
import { currentUserId, requireAuth } from '@/lib/auth/guard'
import {
  clearFailedLogins,
  getClientIp,
  LOGIN_THROTTLED_CODE,
  registerLoginAttempt
} from '@/lib/auth/rate-limit'
import { safeRedirectPath } from '@/lib/auth/redirect'
import { hashSetupCode } from '@/lib/auth/setup-code'
import { verifySetupCode } from '@/lib/auth/setup-code-check'
import type { FormResponse } from '@/lib/types'
import { createFirstUser } from '@/lib/users/create'
import { fetchUserById, hasUsers } from '@/lib/users/data'
import {
  changeEmailSchema,
  changeNameSchema,
  changePasswordSchema,
  completeSetupSchema
} from '@/lib/users/schemas'
import type { User } from '@/lib/users/types'
import {
  updateUserEmail,
  updateUserName,
  updateUserPassword
} from '@/lib/users/update'
import {
  formatValidationResponse,
  normalizeFormData
} from '@/lib/util'

function signInErrorMessage(error: unknown): string | undefined {
  const { type, code } = (error ?? {}) as {
    type?: string
    code?: string
  }
  if (type === 'CredentialsSignin') {
    return code === LOGIN_THROTTLED_CODE
      ? 'Too many attempts — please wait a moment and try again.'
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

const ACCOUNT_EXISTS_MESSAGE = 'An account already exists.'
const CODE_EXPIRED_MESSAGE =
  'This code has expired. In Vercel, open Deployments and click Redeploy for a new one.'

/**
 * Creates the instance's first admin from the setup code printed in
 * the build log, then signs them in. Deliberately public — there is
 * no admin yet to require auth from; see src/lib/auth/setup-code.ts
 * for how the code itself is generated and checked.
 */
export async function completeSetup(
  formData: FormData
): Promise<FormResponse<Record<string, never>>> {
  // Keyed per IP (not a single shared bucket) so a stranger spamming
  // wrong codes throttles only themselves, never the owner trying
  // the real one from a different connection.
  const throttleKey = `setup:${await getClientIp()}`
  let outcome: 'created' | 'exists' | 'expired'

  // Everything up to account creation is a plain DB read or the
  // atomic insert itself; an unexpected failure anywhere in here
  // (not the expected-outcome returns below, which aren't thrown)
  // would otherwise reject the action, and Next.js masks a thrown
  // server-action error to a generic message in production.
  try {
    if ((await registerLoginAttempt(throttleKey)) > 0) {
      return {
        ok: false,
        message:
          'Too many attempts — please wait a moment and try again.'
      }
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

    const validated = completeSetupSchema.safeParse(
      normalizeFormData(formData)
    )
    if (!validated.success) {
      return formatValidationResponse(
        validated.error,
        'Failed to validate account details.'
      )
    }

    // The verifySetupCode() check above is just for a friendly
    // message; this is what's actually race-safe (see
    // createFirstUser's own comment) — it also consumes the
    // setup_code row, so there's nothing left to delete afterward.
    const { name, email, password } = validated.data
    const isCreated = await createFirstUser({
      name,
      email,
      password,
      codeHash: hashSetupCode(submittedCode)
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
    return {
      ok: false,
      message: 'Something went wrong — please try again.'
    }
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

  formData.set('redirectTo', '/dashboard')
  try {
    await signIn('credentials', formData)
    return { ok: true }
  } catch (error) {
    // Successful sign-in redirects by throwing; let Next handle it.
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
        'Account created! Automatic sign-in failed — please log in at /login.'
    }
  }
}

type AccountResponse = FormResponse<Record<string, never>>

const THROTTLED_MESSAGE =
  'Too many attempts — please wait a moment and try again.'
const ACCOUNT_ERROR_MESSAGE =
  'Something went wrong — please try again.'
// A valid session whose user row is gone
const SIGNED_OUT_RESPONSE = {
  ok: false,
  message: 'You must be signed in to perform this action.'
}

async function signedInUser(): Promise<User | null> {
  const id = await currentUserId()
  return id ? await fetchUserById(id) : null
}

/**
 * Shares the login throttle (keyed by email), so a stolen session
 * can't brute-force the password it doesn't know.
 */
async function checkCurrentPassword(
  user: User,
  password: string
): Promise<AccountResponse | null> {
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

    if (await isPasswordBreached(newPassword)) {
      return {
        ok: false,
        message: 'Failed to validate password.',
        errors: {
          newPassword: [
            'This password has appeared in a data breach. Choose another.'
          ]
        }
      }
    }

    await updateUserPassword(user.id, newPassword)
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

    if (!(await updateUserEmail(user.id, email))) {
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
    normalizeFormData(formData)
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
