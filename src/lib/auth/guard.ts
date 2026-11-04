import type { GetServerSidePropsContext } from 'next'
import { cookies, headers } from 'next/headers'

import { auth } from '@/auth'
import type { FormState } from '@/lib/types'

/**
 * Server actions are invoked by action id, not by URL, so the
 * middleware path checks in auth.config.ts do not protect them — an
 * action can be POSTed to any public route. Every server action that
 * is not deliberately public must verify the session itself.
 */

/** For actions returning a FormResponse: `if (denied) return denied` */
export async function requireAuth(): Promise<FormState<never> | null> {
  const session = await auth()
  if (session?.user) return null
  return {
    ok: false,
    message: 'You must be signed in to perform this action.'
  }
}

/** For exposed server functions that throw rather than return errors */
export async function assertAuthed(): Promise<void> {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
}

/** For auth-aware reads that serve both public and authed callers */
export async function isAuthed(): Promise<boolean> {
  const session = await auth()
  return !!session?.user
}

/**
 * isAuthed() that also sees a session cookie set earlier in this
 * request, e.g. by a sign-in action whose re-render reads it.
 * auth() reads headers(), which Next doesn't update after an action
 * sets cookies; cookies() is.
 */
export async function isAuthedIncludingNewCookies(): Promise<boolean> {
  const requestHeaders = new Headers(await headers())
  requestHeaders.set('cookie', (await cookies()).toString())
  // Server components can't set cookies, so a refreshed one is dropped
  const session = await auth({
    req: { headers: requestHeaders },
    res: { headers: new Headers() }
  } as unknown as GetServerSidePropsContext)
  return !!session?.user
}

/** The signed-in user's id, or `null` without a session */
export async function currentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
