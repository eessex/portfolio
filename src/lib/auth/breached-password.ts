import { createHash } from 'node:crypto'

const RANGE_URL = 'https://api.pwnedpasswords.com/range/'
const TIMEOUT_MS = 3000

/**
 * Whether Have I Been Pwned's Pwned Passwords list has this password.
 * k-anonymity: only the first 5 hex characters of its SHA-1 leave the
 * server, and the suffix match happens here. Fails open (`false`):
 * an unreachable API mustn't block a password change.
 */
export async function isPasswordBreached(
  password: string
): Promise<boolean> {
  const hash = createHash('sha1')
    .update(password)
    .digest('hex')
    .toUpperCase()
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  try {
    const res = await fetch(`${RANGE_URL}${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    // Lines are `SUFFIX:COUNT`; padding lines have a count of 0
    return (await res.text()).split('\n').some((line) => {
      const [lineSuffix, count] = line.trim().split(':')
      return lineSuffix === suffix && Number(count) > 0
    })
  } catch (error) {
    console.error('Pwned Passwords check failed:', error)
    return false
  }
}
