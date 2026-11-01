// Deliberately NOT a server action: the admin actions in actions.ts
// call these after checking the session, and the public ones after
// their throttles.
import { hashSecret } from '@/lib/auth/hash-secret'
import { sql } from '@/lib/db'
import { USER_TOKEN_TTL_HOURS } from '@/lib/users/schemas'
import type { UserTokenPurpose } from '@/lib/users/types'

export interface PendingInvite {
  id: string
  createdAt: Date
  expiresAt: Date
  createdByName: string
}

// Used and expired rows have nothing left to do; dropped on each new
// token so the table stays small
const deleteSpentTokens = () => sql`
  DELETE FROM user_tokens
  WHERE used_at IS NOT NULL OR expires_at < now()
`

// Users rows before any token, in id order like deleteUser: the
// insert's created_by check share-locks the creator's row, so a token
// statement holding a token lock while waiting on a user can deadlock
const lockUsers = (ids: string[]) => sql`
  SELECT id, session_version FROM users
  WHERE id = ANY(${ids}::uuid[])
  ORDER BY id
  FOR UPDATE
`

/**
 * Whether the acting admin, as `lockUsers` returned them, still has
 * the session version their password was checked against
 */
export function isActorCurrent(
  locked: Record<string, unknown>[],
  actorId: string,
  sessionVersion: number
): boolean {
  return locked.some(
    (row) =>
      row.id === actorId && row.session_version === sessionVersion
  )
}

// Every write below re-checks the actor's version itself, since a
// Neon HTTP transaction can't branch on the lock's result

/** When the link expires, or `'stale'` if the creator changed. */
export async function createInviteToken(
  createdBy: string,
  sessionVersion: number,
  tokenHash: string
): Promise<Date | 'stale'> {
  try {
    const [, , rows] = await sql.transaction([
      lockUsers([createdBy]),
      deleteSpentTokens(),
      sql`
        INSERT INTO user_tokens
          (purpose, token_hash, created_by, expires_at)
        SELECT
          'invite',
          ${tokenHash},
          id,
          now() + make_interval(hours => ${USER_TOKEN_TTL_HOURS})
        FROM users
        WHERE id = ${createdBy} AND session_version = ${sessionVersion}
        RETURNING expires_at
      `
    ])
    return rows[0] ? new Date(rows[0].expires_at as string) : 'stale'
  } catch (cause) {
    throw new Error('Failed to create invite.', { cause })
  }
}

/**
 * Replaces the user's earlier reset link. `'gone'` if they no longer
 * exist, `'stale'` if the creator changed.
 */
export async function createResetToken(
  createdBy: string,
  sessionVersion: number,
  userId: string,
  tokenHash: string
): Promise<Date | 'gone' | 'stale'> {
  try {
    // The target's lock also serializes concurrent requests for them,
    // so both can't delete before either inserts
    const [locked, , , rows] = await sql.transaction([
      lockUsers([createdBy, userId]),
      deleteSpentTokens(),
      sql`
        DELETE FROM user_tokens
        WHERE purpose = 'reset' AND user_id = ${userId}
          AND EXISTS (
            SELECT 1 FROM users
            WHERE id = ${createdBy} AND session_version = ${sessionVersion}
          )
      `,
      sql`
        INSERT INTO user_tokens
          (purpose, token_hash, user_id, created_by, expires_at,
           session_version)
        SELECT
          'reset',
          ${tokenHash},
          id,
          ${createdBy},
          now() + make_interval(hours => ${USER_TOKEN_TTL_HOURS}),
          session_version
        FROM users
        WHERE id = ${userId} AND EXISTS (
          SELECT 1 FROM users
          WHERE id = ${createdBy} AND session_version = ${sessionVersion}
        )
        RETURNING expires_at
      `
    ])
    if (rows[0]) return new Date(rows[0].expires_at as string)
    return isActorCurrent(locked, createdBy, sessionVersion)
      ? 'gone'
      : 'stale'
  } catch (cause) {
    throw new Error('Failed to create reset link.', { cause })
  }
}

export async function fetchPendingInvites(): Promise<
  PendingInvite[]
> {
  try {
    const rows = await sql`
      SELECT t.id, t.created_at, t.expires_at, u.name AS created_by_name
      FROM user_tokens t
      JOIN users u ON u.id = t.created_by
      WHERE t.purpose = 'invite'
        AND t.used_at IS NULL
        AND t.expires_at > now()
      ORDER BY t.created_at DESC
    `
    return rows.map((row) => ({
      id: row.id as string,
      createdAt: new Date(row.created_at as string),
      expiresAt: new Date(row.expires_at as string),
      createdByName: row.created_by_name as string
    }))
  } catch (cause) {
    throw new Error('Failed to fetch invites.', { cause })
  }
}

/** `false` when it was already used or revoked */
export async function deleteInvite(id: string): Promise<boolean> {
  try {
    const rows = await sql`
      DELETE FROM user_tokens
      WHERE id = ${id} AND purpose = 'invite' AND used_at IS NULL
      RETURNING id
    `
    return rows.length > 0
  } catch (cause) {
    throw new Error('Failed to revoke invite.', { cause })
  }
}

// A cheap check before the bcrypt work a submit costs. A reset link
// is also dead once its target's session version moved on.
export async function isUserTokenLive(
  purpose: UserTokenPurpose,
  tokenHash: string
): Promise<boolean> {
  try {
    const rows = await sql`
      SELECT 1 FROM user_tokens t
      LEFT JOIN users u ON u.id = t.user_id
      WHERE t.token_hash = ${tokenHash}
        AND t.purpose = ${purpose}
        AND t.used_at IS NULL
        AND t.expires_at > now()
        AND (t.user_id IS NULL OR t.session_version = u.session_version)
    `
    return rows.length > 0
  } catch (cause) {
    throw new Error('Failed to check link.', { cause })
  }
}

/**
 * Spends a reset link and sets its user's password, ending their
 * sessions. Returns their email, or `null` for a dead link, including
 * one whose target changed their password or email since.
 */
export async function resetPasswordWithToken(
  tokenHash: string,
  password: string
): Promise<string | null> {
  const hashedPassword = await hashSecret(password)
  try {
    // Users row first, the same lock order as deleteUser
    const [, rows] = await sql.transaction([
      sql`
        SELECT u.id FROM users u
        JOIN user_tokens t ON t.user_id = u.id
        WHERE t.token_hash = ${tokenHash}
        FOR UPDATE OF u
      `,
      sql`
        WITH consumed AS (
          UPDATE user_tokens t SET used_at = now()
          FROM users u
          WHERE t.token_hash = ${tokenHash}
            AND t.purpose = 'reset'
            AND t.used_at IS NULL
            AND t.expires_at > now()
            AND u.id = t.user_id
            AND t.session_version = u.session_version
          RETURNING t.user_id
        )
        UPDATE users SET
          password = ${hashedPassword},
          session_version = session_version + 1,
          updated_at = now()
        WHERE id IN (SELECT user_id FROM consumed)
        RETURNING email
      `
    ])
    return (rows[0]?.email as string | undefined) ?? null
  } catch (cause) {
    throw new Error('Failed to reset password.', { cause })
  }
}
