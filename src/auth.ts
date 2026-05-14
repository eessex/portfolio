import bcrypt from 'bcrypt'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

import { authConfig } from '@/auth.config'
import { fetchUserByEmail } from '@/lib/users/data'

export const {
  auth,
  handlers,
  signIn,
  signOut
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize (credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(), password: z.string().min(8)
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const {
            email,
            password
          } = parsedCredentials.data
          const user = await fetchUserByEmail(email)
          if (!user) return null
          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            return {
              ...user,
              password: undefined
            }
          }
        }

        console.log('Please try again')
        return null
      }
    })
  ]
})
