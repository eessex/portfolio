'use server'

import { unstable_rethrow } from 'next/navigation'

import { signIn } from '@/auth'
import { LOGIN_THROTTLED_CODE } from '@/lib/auth/rate-limit'
import { safeRedirectPath } from '@/lib/auth/redirect'
import type { FormResponse } from '@/lib/types'

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
