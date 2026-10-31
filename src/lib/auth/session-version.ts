import type { User } from 'next-auth'
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
 * for server-side auth() calls, not the middleware's, so page
 * navigation alone doesn't pay for the lookup; every mutation still
 * checks through requireAuth().
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
    // Fail open: writes fail anyway while the DB is unreachable
    console.error('Failed to check session version:', error)
    return token
  }
}
