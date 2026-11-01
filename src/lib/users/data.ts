import { sql } from '@/lib/db'
import type { UserRow, UserSummary } from '@/lib/users/types'

export async function fetchUserByEmail(
  email: string
): Promise<UserRow | null> {
  try {
    const users = await sql`
      SELECT * FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    return (users[0] as UserRow) ?? null
  } catch (cause) {
    throw new Error('Failed to fetch user.', { cause })
  }
}

export async function fetchUserById(
  id: string
): Promise<UserRow | null> {
  try {
    const users = await sql`
      SELECT * FROM users
      WHERE id = ${id}
      LIMIT 1
    `

    return (users[0] as UserRow) ?? null
  } catch (cause) {
    throw new Error('Failed to fetch user.', { cause })
  }
}

/**
 * Stamps a successful login, only while the account still has the
 * session version its password was checked against: a password or
 * email change landing mid-login would otherwise hand the old
 * credentials a token for the new version. Returns whether it did.
 */
export async function recordLogin(
  id: string,
  sessionVersion: number
): Promise<boolean> {
  try {
    const rows = await sql`
      UPDATE users SET last_login_at = now()
      WHERE id = ${id} AND session_version = ${sessionVersion}
      RETURNING id
    `
    return rows.length > 0
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

/** The Users page's rows, oldest account first. */
export async function fetchUsers(): Promise<UserSummary[]> {
  try {
    const rows = await sql`
      SELECT id, name, email, created_at, last_login_at
      FROM users
      ORDER BY created_at, id
    `
    return rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      createdAt: new Date(row.created_at as string),
      lastLoginAt: row.last_login_at
        ? new Date(row.last_login_at as string)
        : undefined
    }))
  } catch (cause) {
    throw new Error('Failed to fetch users.', { cause })
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
