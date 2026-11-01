// Deliberately NOT a server action ('use server' would expose this as
// a public endpoint). Accounts are created only by the actions in
// actions.ts, after their own checks: completeSetup and acceptInvite.
import { hashSecret } from '@/lib/auth/hash-secret'
import { sql } from '@/lib/db'

export async function createUser(input: {
  name: string
  email: string
  password: string
}): Promise<void> {
  const password = await hashSecret(input.password)
  try {
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${input.name}, ${input.email}, ${password})
    `
  } catch (cause) {
    throw new Error('Failed to create user.', { cause })
  }
}

/**
 * Creates the account /setup offers, consuming the matching
 * `setup_code` row in the same statement. That DELETE is what makes
 * two simultaneous submits race-safe — Postgres serializes concurrent
 * deletes of the same row, so only one transaction's `consumed` CTE
 * is ever non-empty — unlike a plain `WHERE NOT EXISTS (SELECT 1 FROM
 * users)`, which checks an empty table that has no row to lock and so
 * doesn't stop two different emails from both passing the check.
 * `NOT EXISTS (SELECT 1 FROM users)` is kept as a belt-and-suspenders
 * guard against a `pnpm run setup` admin created out of band on the
 * same database. The account's recovery codes are inserted in the
 * same statement, so it never exists without them. Returns whether
 * this call won.
 */
export async function createFirstUser(input: {
  name: string
  email: string
  password: string
  codeHash: string
  recoveryCodeHashes: string[]
}): Promise<boolean> {
  const hashedPassword = await hashSecret(input.password)
  try {
    const rows = await sql`
      WITH consumed AS (
        DELETE FROM setup_code
        WHERE id = true
          AND code_hash = ${input.codeHash}
          AND expires_at > now()
        RETURNING 1
      ), created AS (
        INSERT INTO users (name, email, password)
        SELECT ${input.name}, ${input.email}, ${hashedPassword}
        WHERE EXISTS (SELECT 1 FROM consumed)
          AND NOT EXISTS (SELECT 1 FROM users)
        RETURNING id
      ), codes AS (
        INSERT INTO user_recovery_codes (user_id, code_hash)
        SELECT created.id, hash
        FROM created, unnest(${input.recoveryCodeHashes}::text[]) AS hash
      )
      SELECT id FROM created
    `
    return rows.length > 0
  } catch (cause) {
    throw new Error('Failed to create first user.', { cause })
  }
}

// One statement, so a link can't create two admins; a taken email
// fails all of it and leaves the link unspent
export async function createInvitedUser(input: {
  name: string
  email: string
  password: string
  tokenHash: string
  recoveryCodeHashes: string[]
}): Promise<'created' | 'invalid' | 'taken'> {
  const hashedPassword = await hashSecret(input.password)
  try {
    const rows = await sql`
      WITH consumed AS (
        UPDATE user_tokens SET used_at = now()
        WHERE token_hash = ${input.tokenHash}
          AND purpose = 'invite'
          AND used_at IS NULL
          AND expires_at > now()
        RETURNING id
      ), created AS (
        INSERT INTO users (name, email, password)
        SELECT ${input.name}, ${input.email}, ${hashedPassword}
        WHERE EXISTS (SELECT 1 FROM consumed)
        RETURNING id
      ), codes AS (
        INSERT INTO user_recovery_codes (user_id, code_hash)
        SELECT created.id, hash
        FROM created, unnest(${input.recoveryCodeHashes}::text[]) AS hash
      )
      SELECT id FROM created
    `
    return rows.length > 0 ? 'created' : 'invalid'
  } catch (cause) {
    // unique_violation on email (any case), as in updateUserEmail
    if ((cause as { code?: string } | undefined)?.code === '23505') {
      return 'taken'
    }
    throw new Error('Failed to create invited user.', { cause })
  }
}
