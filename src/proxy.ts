import NextAuth from 'next-auth'

import { authConfig } from '@/auth.config'
import { authSecret } from '@/lib/auth/secret'

export default NextAuth(async () => ({
  ...authConfig,
  secret: await authSecret()
})).auth

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  // Skips static files (favicon, robots.txt, icons, ...) so they aren't
  // gated to /login before setup. Only listed extensions: slugs have no
  // dots today, but a page route must never slip past auth.
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpe?g|svg|webp|txt|xml|webmanifest)$).*)'
  ]
}
