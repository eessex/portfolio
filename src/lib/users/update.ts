// Deliberately NOT a server action: the account actions in
// actions.ts call these after checking the session and password.
import { hashSecret } from '@/lib/auth/hash-secret'
import { sql } from '@/lib/db'
import { isActorCurrent } from '@/lib/users/tokens'

// Each email/password write lands only while the account still has
// the session version the caller checked the current password
// against, so two concurrent changes can't both pass that check and
// the later one overwrite the first (and renew a revoked session).

/**
 * Ends the account's other sessions. Returns `false` when the account
 * changed since `sessionVersion` was read.
 */
export async function updateUserPassword(
  id: string,
  password: string,
  sessionVersion: number
): Promise<boolean> {
  const hashedPassword = await hashSecret(password)
  try {
    const rows = await sql`
      UPDATE users SET
        password = ${hashedPassword},
        session_version = session_version + 1,
        updated_at = now()
      WHERE id = ${id} AND session_version = ${sessionVersion}
      RETURNING id
    `
    return rows.length > 0
  } catch (cause) {
    throw new Error('Failed to update password.', { cause })
  }
}

/** Ends the account's other sessions. */
export async function updateUserEmail(
  id: string,
  email: string,
  sessionVersion: number
): Promise<'updated' | 'taken' | 'stale'> {
  try {
    const rows = await sql`
      UPDATE users SET
        email = ${email},
        session_version = session_version + 1,
        updated_at = now()
      WHERE id = ${id} AND session_version = ${sessionVersion}
      RETURNING id
    `
    return rows.length > 0 ? 'updated' : 'stale'
  } catch (cause) {
    // unique_violation; matched by code since older DBs may also
    // have a seed-era users_email_key constraint
    if ((cause as { code?: string } | undefined)?.code === '23505') {
      return 'taken'
    }
    throw new Error('Failed to update email.', { cause })
  }
}

// Locks every users row first, so two admins removing each other
// can't leave none
/**
 * Never the last admin or `actingUserId`; tokens and codes cascade.
 * `'stale'` if the acting admin changed since `sessionVersion` was
 * read (or is gone), `'gone'` if the target already is.
 */
export async function deleteUser(
  id: string,
  actingUserId: string,
  sessionVersion: number
): Promise<'deleted' | 'gone' | 'stale'> {
  try {
    const [locked, rows] = await sql.transaction([
      sql`SELECT id, session_version FROM users ORDER BY id FOR UPDATE`,
      sql`
        DELETE FROM users
        WHERE id = ${id}
          AND id <> ${actingUserId}
          AND EXISTS (
            SELECT 1 FROM users
            WHERE id = ${actingUserId}
              AND session_version = ${sessionVersion}
          )
        RETURNING id
      `
    ])
    if (rows.length > 0) return 'deleted'
    return isActorCurrent(locked, actingUserId, sessionVersion)
      ? 'gone'
      : 'stale'
  } catch (cause) {
    throw new Error('Failed to remove user.', { cause })
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
