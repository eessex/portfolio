// Reads the setup_code row — split out from setup-code.ts so that
// pure/crypto file (depended on by every-deploy.ts, run by the
// migration script) never pulls in the app's db client.
import { timingSafeEqual } from 'node:crypto'

import { hashSetupCode } from '@/lib/auth/setup-code'
import { sql } from '@/lib/db'

async function fetchSetupCode(): Promise<{
  codeHash: string
  expiresAt: Date
} | null> {
  try {
    const rows = await sql`
      SELECT code_hash, expires_at FROM setup_code LIMIT 1
    `
    const row = rows[0]
    if (!row) return null
    return {
      codeHash: row.code_hash as string,
      expiresAt: new Date(row.expires_at as string)
    }
  } catch (cause) {
    throw new Error('Failed to fetch setup code.', { cause })
  }
}

export type SetupCodeCheck = 'valid' | 'wrong' | 'expired'

/**
 * Checks a submitted code against the stored hash: no row (none ever
 * generated, or it was already used) and a hash mismatch both read as
 * `'wrong'`, since the visitor has nothing to tell them apart.
 * Expiry is checked before the hash, so an expired code never leaks
 * through a successful-looking compare.
 */
export async function verifySetupCode(
  submitted: string
): Promise<SetupCodeCheck> {
  const stored = await fetchSetupCode()
  if (!stored) return 'wrong'
  if (stored.expiresAt.getTime() < Date.now()) return 'expired'

  const a = Buffer.from(hashSetupCode(submitted))
  const b = Buffer.from(stored.codeHash)
  return a.length === b.length && timingSafeEqual(a, b)
    ? 'valid'
    : 'wrong'
}
