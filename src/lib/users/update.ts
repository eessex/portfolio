// Deliberately NOT a server action: the account actions in
// actions.ts call these after checking the session and password.
import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'

const SALT_ROUNDS = 10

/** Ends the account's other sessions (see auth/session-version.ts). */
export async function updateUserPassword(
  id: string,
  password: string
): Promise<void> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  try {
    await sql`
      UPDATE users SET
        password = ${hashedPassword},
        session_version = session_version + 1,
        updated_at = now()
      WHERE id = ${id}
    `
  } catch (cause) {
    throw new Error('Failed to update password.', { cause })
  }
}

/**
 * Ends the account's other sessions. Returns `false` when another
 * account already has the address.
 */
export async function updateUserEmail(
  id: string,
  email: string
): Promise<boolean> {
  try {
    await sql`
      UPDATE users SET
        email = ${email},
        session_version = session_version + 1,
        updated_at = now()
      WHERE id = ${id}
    `
    return true
  } catch (cause) {
    // unique_violation; matched by code since older DBs may also
    // have a seed-era users_email_key constraint
    if ((cause as { code?: string } | undefined)?.code === '23505') {
      return false
    }
    throw new Error('Failed to update email.', { cause })
  }
}

export async function updateUserName(
  id: string,
  name: string
): Promise<void> {
  try {
    await sql`
      UPDATE users SET name = ${name}, updated_at = now()
      WHERE id = ${id}
    `
  } catch (cause) {
    throw new Error('Failed to update name.', { cause })
  }
}
