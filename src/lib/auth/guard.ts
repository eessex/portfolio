import type { GetServerSidePropsContext } from 'next'
import { cookies, headers } from 'next/headers'
import type { Session } from 'next-auth'

import { auth } from '@/auth'
import type { FormState } from '@/lib/types'

/**
 * Server actions are invoked by action id, not by URL, so the
 * middleware path checks in auth.config.ts do not protect them — an
 * action can be POSTed to any public route. Every server action that
 * is not deliberately public must verify the session itself.
 */

/**
 * auth(), but it also sees a session cookie set earlier in this
 * request: a sign-in action's re-render (completeSetup, a renewed
 * session after an email/password change). auth() reads headers(),
 * which Next doesn't update when an action sets cookies; cookies()
 * is.
 */
export async function currentSession(): Promise<Session | null> {
  const requestHeaders = new Headers(await headers())
  requestHeaders.set('cookie', (await cookies()).toString())
  // Refreshed cookies are dropped, as with auth() in a render
  return auth({
    req: { headers: requestHeaders },
    res: { headers: new Headers() }
  } as unknown as GetServerSidePropsContext)
}

/** For actions returning a FormResponse: `if (denied) return denied` */
export async function requireAuth(): Promise<FormState<never> | null> {
  const session = await currentSession()
  if (session?.user) return null
  return {
    ok: false,
    message: 'You must be signed in to perform this action.'
  }
}

/** For exposed server functions that throw rather than return errors */
export async function assertAuthed(): Promise<void> {
  const session = await currentSession()
  if (!session?.user) throw new Error('Unauthorized')
}

/** For auth-aware reads that serve both public and authed callers */
export async function isAuthed(): Promise<boolean> {
  const session = await currentSession()
  return !!session?.user
}

/** The signed-in user's id, or `null` without a session */
export async function currentUserId(): Promise<string | null> {
  const session = await currentSession()
  return session?.user?.id ?? null
}
