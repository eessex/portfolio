import type { NextAuthConfig } from 'next-auth'

import { isAuthedPath, isUnauthedPath } from '@/lib/auth/paths'
import { hasSiteSettings } from '@/lib/site-settings/data'

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

export const authConfig = {
  trustHost: true,
  pages: { signIn: '/login' },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
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
