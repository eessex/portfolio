import bcrypt from 'bcrypt'
import NextAuth, {
  CredentialsSignin,
  type NextAuthConfig
} from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

import { authConfig } from '@/auth.config'
import { DUMMY_PASSWORD_HASH } from '@/lib/auth/dummy-hash'
import {
  clearFailedLogins,
  LOGIN_THROTTLED_CODE,
  registerLoginAttempt
} from '@/lib/auth/rate-limit'
import { authSecret } from '@/lib/auth/secret'
import { fetchUserByEmail, recordLogin } from '@/lib/users/data'

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

/** Surfaced to `authenticate` via its `code` (a documented
 * next-auth pattern) so the form can show a throttle message
 * instead of "Invalid credentials." */
class ThrottledSignin extends CredentialsSignin {
  code = LOGIN_THROTTLED_CODE
}

const config = {
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials =
          CredentialsSchema.safeParse(credentials)

        if (!parsedCredentials.success) return null

        const { email, password } = parsedCredentials.data

        // Provisionally records the attempt as a failure in the
        // same statement that checks the backoff, then clears it
        // below on success — see src/lib/auth/rate-limit.ts.
        if ((await registerLoginAttempt(email)) > 0) {
          throw new ThrottledSignin()
        }

        const user = await fetchUserByEmail(email)

        const passwordsMatch = await bcrypt.compare(
          password,
          user?.password ?? DUMMY_PASSWORD_HASH
        )
        if (!user || !passwordsMatch) return null

        const { id, name, session_version: sessionVersion } = user
        // The account changed since it was read: treat as a failure
        if (!(await recordLogin(id, sessionVersion))) return null

        await clearFailedLogins(email)
        return { id, name, email: user.email, sessionVersion }
      }
    })
  ]
} satisfies NextAuthConfig

// Lazy config: the secret may come from the database
export const { auth, handlers, signIn, signOut } = NextAuth(
  async () => ({ ...config, secret: await authSecret() })
)
