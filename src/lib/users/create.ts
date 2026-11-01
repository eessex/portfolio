// Deliberately NOT a server action ('use server' would expose this as
// a public endpoint). User creation is only available to server-side
// scripts — currently scripts/setup.ts.
import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'

const SALT_ROUNDS = 10

export async function createUser(input: {
  name: string
  email: string
  password: string
}): Promise<void> {
  const password = await bcrypt.hash(input.password, SALT_ROUNDS)
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
  const hashedPassword = await bcrypt.hash(
    input.password,
    SALT_ROUNDS
  )
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
