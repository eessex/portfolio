// Deliberately NOT a server action: the plain token is only ever
// handed back once, by the admin action that created it.
import { createHash, randomBytes } from 'node:crypto'

// 256 bits; base64url so it sits in a URL fragment unescaped
const USER_TOKEN_BYTES = 32

/** sha256 of the token, as stored in `user_tokens.token_hash`. */
export function hashUserToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex')
}

export function generateUserToken(): { token: string; hash: string } {
  const token = randomBytes(USER_TOKEN_BYTES).toString('base64url')
  return { token, hash: hashUserToken(token) }
}
