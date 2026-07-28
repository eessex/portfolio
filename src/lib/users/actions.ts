'use server'

import bcrypt from 'bcrypt'
import { unstable_rethrow } from 'next/navigation'

import { signIn } from '@/auth'
import { LOGIN_THROTTLED_CODE } from '@/lib/auth/rate-limit'
import { sql } from '@/lib/db'
import type { FormResponse } from '@/lib/types'
import type { User } from '@/lib/users/types'

const SALT_ROUNDS = 10

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

// This function is currently only called during the initial setup of the app.
// Update this function to validate form data if it is ever called in other contexts.
export async function createUser(input: {
  name: string
  email: string
  password: string
}): Promise<User> {
  const password = await bcrypt.hash(input.password, SALT_ROUNDS)
  try {
    const users = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${input.name}, ${input.email}, ${password})
      RETURNING *
    `

    return users[0] as User
  } catch (cause) {
    throw new Error('Failed to create user.', { cause })
  }
}
