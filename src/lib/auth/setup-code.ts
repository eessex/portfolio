// Deliberately NOT a server action: generating or hashing the plain
// code has no reason to be reachable from the browser. Pure/crypto
// only — no `@/lib/db` import — since every-deploy.ts (run by the
// migration script, never the app's db client) depends on this file.
import { createHash } from 'node:crypto'

import {
  generateGroupedCode,
  normalizeGroupedCode
} from '@/lib/auth/grouped-code'

export const SETUP_CODE_LENGTH = 16
const SETUP_CODE_GROUP_SIZE = 4

export const SETUP_CODE_TTL_HOURS = 72

/** A new random code, grouped for reading (`K7QM-3XRD-PW9T-H2FC`). */
export function generateSetupCode(): string {
  return generateGroupedCode(SETUP_CODE_LENGTH, SETUP_CODE_GROUP_SIZE)
}

/** sha256 of the normalized code, as stored in `setup_code`. */
export function hashSetupCode(code: string): string {
  return createHash('sha256')
    .update(normalizeGroupedCode(code))
    .digest('hex')
}

/** The banner the build log prints while the code is live. */
export function buildSetupCodeBanner(code: string): string {
  const divider = '='.repeat(50)
  return [
    divider,
    `  Setup code: ${code}`,
    '  Open your site and enter it to create your account.',
    `  Expires in ${SETUP_CODE_TTL_HOURS} hours. Redeploy after that for a new one.`,
    divider
  ].join('\n')
}

/** Printed instead of a banner while an earlier build's code is live,
 * since only that build's log has the plain code. */
export function buildLiveSetupCodeNote(expiresAt: Date): string {
  return `  A setup code from an earlier build is still valid until ${expiresAt.toISOString()}; find it in that build's log.`
}
