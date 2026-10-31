import type { z } from 'zod'

import type { userSchema } from '@/lib/users/schemas'

export type User = z.infer<typeof userSchema>

/** A users row as the fetchers in data.ts return it (snake_case). */
export type UserRow = Pick<
  User,
  'id' | 'name' | 'email' | 'password'
> & {
  session_version: number
}
