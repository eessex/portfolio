// Deliberately NOT a server action: generating or hashing the plain
// code has no reason to be reachable from the browser.
import { createHash, randomInt } from 'node:crypto'

/**
 * Crockford's Base32 alphabet: digits plus letters, dropping I, L, O
 * and U, each too easily misread against 1, 1, 0 and V.
 */
export const SETUP_CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export const SETUP_CODE_LENGTH = 16
const SETUP_CODE_GROUP_SIZE = 4

export const SETUP_CODE_TTL_HOURS = 72

/** Strips the grouping dashes/spaces and uppercases, so entry is
 * case- and formatting-insensitive. */
export function normalizeSetupCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase()
}

/** A new random code, grouped for reading (`K7QM-3XRD-PW9T-H2FC`). */
export function generateSetupCode(): string {
  let raw = ''
  for (let i = 0; i < SETUP_CODE_LENGTH; i++) {
    raw += SETUP_CODE_ALPHABET[randomInt(SETUP_CODE_ALPHABET.length)]
  }
  const groups = raw.match(
    new RegExp(`.{1,${SETUP_CODE_GROUP_SIZE}}`, 'g')
  )
  return (groups ?? [raw]).join('-')
}

/** sha256 of the normalized code, as stored in `setup_code`. */
export function hashSetupCode(code: string): string {
  return createHash('sha256')
    .update(normalizeSetupCode(code))
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
