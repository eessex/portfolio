import type { z } from 'zod'

import type {
  userSchema,
  userTokenPurposeSchema
} from '@/lib/users/schemas'

export type User = z.infer<typeof userSchema>

export type UserTokenPurpose = z.infer<typeof userTokenPurposeSchema>

/** A users row as the fetchers in data.ts return it (snake_case). */
export type UserRow = Pick<
  User,
  'id' | 'name' | 'email' | 'password'
> & {
  session_version: number
}

/** A Users page row; no password. */
export interface UserSummary {
  id: string
  name: string
  email: string
  createdAt: Date
  lastLoginAt?: Date
}
