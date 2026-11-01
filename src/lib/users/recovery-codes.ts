// Deliberately NOT a server action: the account actions in actions.ts
// call these after checking the session or a recovery code.
import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'

const SALT_ROUNDS = 10

// `null` for an unknown email; one query either way, for timing
export async function fetchUnusedRecoveryCodesByEmail(
  email: string
): Promise<{
  userId: string
  codes: { id: string; code_hash: string }[]
} | null> {
  try {
    const rows = await sql`
      SELECT u.id AS user_id, c.id, c.code_hash
      FROM users u
      LEFT JOIN user_recovery_codes c
        ON c.user_id = u.id AND c.used_at IS NULL
      WHERE u.email = ${email}
    `
    if (!rows[0]) return null
    return {
      userId: rows[0].user_id as string,
      codes: rows
        .filter((row) => row.id)
        .map((row) => ({
          id: row.id as string,
          code_hash: row.code_hash as string
        }))
    }
  } catch (cause) {
    throw new Error('Failed to fetch recovery codes.', { cause })
  }
}

export async function countUnusedRecoveryCodes(
  userId: string
): Promise<number> {
  try {
    const rows = await sql`
      SELECT count(*)::int AS count FROM user_recovery_codes
      WHERE user_id = ${userId} AND used_at IS NULL
    `
    return (rows[0]?.count as number) ?? 0
  } catch (cause) {
    throw new Error('Failed to count recovery codes.', { cause })
  }
}

/**
 * `false` when `sessionVersion` is stale. Row lock so a double submit
 * can't leave two sets live.
 */
export async function replaceRecoveryCodes(
  userId: string,
  sessionVersion: number,
  hashes: string[]
): Promise<boolean> {
  try {
    // No branching inside a Neon HTTP transaction, so each write
    // re-checks the version itself
    const [locked] = await sql.transaction([
      sql`
        SELECT session_version FROM users
        WHERE id = ${userId} FOR UPDATE
      `,
      sql`
        DELETE FROM user_recovery_codes
        WHERE user_id = ${userId} AND EXISTS (
          SELECT 1 FROM users
          WHERE id = ${userId} AND session_version = ${sessionVersion}
        )
      `,
      sql`
        INSERT INTO user_recovery_codes (user_id, code_hash)
        SELECT ${userId}, hash
        FROM unnest(${hashes}::text[]) AS hash
        WHERE EXISTS (
          SELECT 1 FROM users
          WHERE id = ${userId} AND session_version = ${sessionVersion}
        )
      `
    ])
    return locked[0]?.session_version === sessionVersion
  } catch (cause) {
    throw new Error('Failed to replace recovery codes.', { cause })
  }
}

/** `false` when a concurrent submit used the code first */
export async function resetPasswordWithRecoveryCode(
  userId: string,
  codeId: string,
  password: string
): Promise<boolean> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  try {
    // Users row first, the same lock order as replaceRecoveryCodes
    const [, rows] = await sql.transaction([
      sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`,
      sql`
      WITH consumed AS (
        UPDATE user_recovery_codes SET used_at = now()
        WHERE id = ${codeId}
          AND user_id = ${userId}
          AND used_at IS NULL
        RETURNING user_id
      )
      UPDATE users SET
        password = ${hashedPassword},
        session_version = session_version + 1,
        updated_at = now()
      WHERE id IN (SELECT user_id FROM consumed)
      RETURNING id
    `
    ])
    return rows.length > 0
  } catch (cause) {
    throw new Error('Failed to reset password.', { cause })
  }
}
