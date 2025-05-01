import type { NextAuthConfig } from 'next-auth'

const authedPaths = [
  '/about/edit',
  '/dashboard',
  '/settings'
]

const unauthedPaths = [
  '/login'
]

export const authConfig = {
  pages: {
    signIn: '/'
  },
  callbacks: {
    authorized ({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthedPath = authedPaths.find(p => nextUrl.pathname.startsWith(p))
      const isUnauthedPath = unauthedPaths.find(p => nextUrl.pathname.startsWith(p))
      if (isAuthedPath) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users
      } else if (isUnauthedPath) {
        if (!isLoggedIn) return true // Allow unauthenticated users
        return false // Redirect authenticated users
      }
      return true
    },
  },
  providers: []
} satisfies NextAuthConfig
