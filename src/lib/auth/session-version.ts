import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { cache } from 'react'

import { fetchSessionVersion } from '@/lib/users/data'

declare module 'next-auth' {
  interface User {
    sessionVersion?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sessionVersion?: number
  }
}

// One lookup per request, however many auth() calls render
const currentSessionVersion = cache(fetchSessionVersion)

/**
 * The `jwt` callback. Sessions are JWTs, so bumping
 * `users.session_version` (password change, recovery, removal) ends
 * every other session only because each one is checked here. Runs
 * for server-side auth() calls and the proxy's, so a revoked token
 * can't reach protected pages either (and the proxy clears its
 * cookie, leaving /login reachable). Only requests carrying a
 * session token pay for the lookup.
 */
export async function checkSessionVersion({
  token,
  user
}: {
  token: JWT
  user?: User
}): Promise<JWT | null> {
  // Sign-in: user is the authorize() result
  if (user)
    return { ...token, sessionVersion: user.sessionVersion ?? 0 }
  if (!token.sub) return null

  try {
    const version = await currentSessionVersion(token.sub)
    // Tokens from before session versions existed carry none: 0
    return version === (token.sessionVersion ?? 0) ? token : null
  } catch (error) {
    // Fail closed: a revoked token must not pass while the version
    // can't be read (storage deletes don't need the DB). Signing in
    // needs the DB too, so this only costs a re-login after an outage
    console.error('Failed to check session version:', error)
    return null
  }
}

/** The `session` callback: exposes the user id to server code. */
export function withUserId({
  session,
  token
}: {
  session: Session
  token: JWT
}): Session {
  if (token.sub && session.user) session.user.id = token.sub
  return session
}
