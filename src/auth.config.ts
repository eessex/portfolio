import type { NextAuthConfig } from 'next-auth'

import { pagePaths } from '@/lib/schemas'

const authedPathPatterns = [
  ...pagePaths.map(
    (type) => new RegExp(`^/${type}/[^/]+/edit$`) // /events/:slug/edit
  ),
  ...pagePaths.map(
    (type) => new RegExp(`^/${type}/new$`) // /events/new
  ),
  /^\/about\/edit$/,
  /^\/dashboard(?:\/.*)?$/
]

const unauthedPathPatterns = [/^\/login$/]

export const authConfig = {
  pages: { signIn: '/' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      const isAuthedPath = authedPathPatterns.some((pattern) =>
        pattern.test(nextUrl.pathname)
      )

      const isUnauthedPath = unauthedPathPatterns.some((pattern) =>
        pattern.test(nextUrl.pathname)
      )

      if (isAuthedPath) {
        return isLoggedIn // Redirect unauthenticated users
      } else if (isUnauthedPath) {
        return !isLoggedIn // allow unauthenticated users only
      }

      return true // everything else is public
    }
  },
  providers: []
} satisfies NextAuthConfig
