import { sql } from '@/lib/db'
import type { User } from '@/lib/users/types'

export async function fetchUserByEmail(
  email: string
): Promise<User | null> {
  try {
    const users = await sql`
      SELECT * FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    return (users[0] as User) ?? null
  } catch (cause) {
    throw new Error('Failed to fetch user.', { cause })
  }
}

/**
 * Stamps a successful login and returns the session version the new
 * session carries.
 */
export async function recordLogin(id: string): Promise<number> {
  try {
    const rows = await sql`
      UPDATE users SET last_login_at = now()
      WHERE id = ${id}
      RETURNING session_version
    `
    return (rows[0]?.session_version as number) ?? 0
  } catch (cause) {
    throw new Error('Failed to record login.', { cause })
  }
}

/** `null` when the user no longer exists. */
export async function fetchSessionVersion(
  id: string
): Promise<number | null> {
  try {
    const rows = await sql`
      SELECT session_version FROM users
      WHERE id = ${id}
      LIMIT 1
    `
    return rows[0] ? (rows[0].session_version as number) : null
  } catch (cause) {
    throw new Error('Failed to fetch session version.', { cause })
  }
}

export async function countUsers(): Promise<number> {
  try {
    const rows = await sql`SELECT count(*)::int AS count FROM users`
    return (rows[0]?.count as number) ?? 0
  } catch (cause) {
    throw new Error('Failed to count users.', { cause })
  }
}

/** Whether any user exists yet (first-run setup). */
export async function hasUsers(): Promise<boolean> {
  try {
    const rows = await sql`
      SELECT EXISTS(SELECT 1 FROM users) AS exists
    `
    return Boolean(rows[0]?.exists)
  } catch (cause) {
    throw new Error('Failed to check users.', { cause })
  }
}
