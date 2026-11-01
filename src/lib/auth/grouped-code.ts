// Pure/crypto only: setup-code.ts (imported by every-deploy.ts) and
// recovery-codes.ts both build on this.
import { randomInt } from 'node:crypto'

/**
 * Crockford's Base32 alphabet: digits plus letters, dropping I, L, O
 * and U, each too easily misread against 1, 1, 0 and V.
 */
export const GROUPED_CODE_ALPHABET =
  '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/** Case- and formatting-insensitive form, for hashing and comparing */
export function normalizeGroupedCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase()
}

/** `length` random characters, dash-grouped for reading. */
export function generateGroupedCode(
  length: number,
  groupSize: number
): string {
  let raw = ''
  for (let i = 0; i < length; i++) {
    raw +=
      GROUPED_CODE_ALPHABET[randomInt(GROUPED_CODE_ALPHABET.length)]
  }
  const groups = raw.match(new RegExp(`.{1,${groupSize}}`, 'g'))
  return (groups ?? [raw]).join('-')
}
