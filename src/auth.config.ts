import { NextResponse } from 'next/server'
import type { NextAuthConfig } from 'next-auth'

import { isAuthedPath, isUnauthedPath } from '@/lib/auth/paths'
import { hasSiteSettings } from '@/lib/site-settings/data'
import { hasUsers } from '@/lib/users/data'

const SETUP_PATH = '/setup'

// site_settings is created once during first-run setup and never
// deleted, so once we've observed it exists we can stop asking — this
// callback runs on every request through Edge Middleware, and without
// memoizing the `true` result every anonymous page view would pay for
// a DB round trip for the lifetime of the app.
let isSiteConfigured = false

async function siteIsConfigured(): Promise<boolean> {
  if (isSiteConfigured) return true
  try {
    isSiteConfigured = await hasSiteSettings()
  } catch (error) {
    // Fail open: a transient DB error shouldn't take down every public
    // page for every logged-out visitor.
    console.error('Failed to check site_settings existence:', error)
    return true
  }
  return isSiteConfigured
}

// Same memoization as isSiteConfigured above: a user, once created,
// is never the last one deleted (there's no such flow), so there's
// nothing to re-check once this has seen one.
let isAnyUserCreated = false

async function anyUserIsCreated(): Promise<boolean> {
  if (isAnyUserCreated) return true
  try {
    isAnyUserCreated = await hasUsers()
  } catch (error) {
    // Fail open: a transient DB error must not drop a live, already
    // set-up instance into setup-only mode for every visitor.
    console.error('Failed to check users existence:', error)
    return true
  }
  return isAnyUserCreated
}

export const authConfig = {
  trustHost: true,
  pages: { signIn: '/login' },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      // Before any admin exists, /setup is the only reachable page —
      // nobody could be logged in yet either way.
      if (!(await anyUserIsCreated())) {
        return nextUrl.pathname === SETUP_PATH
          ? true
          : NextResponse.redirect(new URL(SETUP_PATH, nextUrl))
      }

      const isLoggedIn = !!auth?.user

      if (isAuthedPath(nextUrl.pathname)) {
        return isLoggedIn // Redirect unauthenticated users
      } else if (isUnauthedPath(nextUrl.pathname)) {
        return !isLoggedIn // allow unauthenticated users only
      } else if (isLoggedIn) {
        return true // everything else is public once logged in
      }

      // Logged-out visitor on an otherwise-public page: until the
      // instance has completed first-run setup, only /login is reachable.
      return await siteIsConfigured()
    }
  },
  providers: []
} satisfies NextAuthConfig
