import bcrypt from 'bcrypt'
import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

import { authConfig } from '@/auth.config'
import {
  clearFailedLogins,
  LOGIN_THROTTLED_CODE,
  registerLoginAttempt
} from '@/lib/auth/rate-limit'
import { fetchUserByEmail } from '@/lib/users/data'

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

/**
 * A real bcrypt hash (cost 10, same as user hashes) of a random
 * value nothing can match. Compared against when no user is found so
 * unknown and known emails take the same time to reject — otherwise
 * response timing reveals which emails have accounts.
 */
const DUMMY_PASSWORD_HASH =
  '$2b$10$jbuOzkjIvg398zktHoqbcuNDcVdJhtMq2ZgWpRlLZ0Gldto8CSdQa'

export const { auth, handlers, signIn, signOut } = NextAuth({
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

        await clearFailedLogins(email)
        const { password: _, ...safeUser } = user
        return safeUser
      }
    })
  ]
})
