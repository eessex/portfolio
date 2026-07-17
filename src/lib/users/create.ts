// Deliberately NOT a server action ('use server' would expose this as
// a public endpoint). User creation is only available to server-side
// scripts — currently scripts/setup.ts.
import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'
import type { User } from '@/lib/users/types'

const SALT_ROUNDS = 10

export async function createUser(input: {
  name: string
  email: string
  password: string
}): Promise<User> {
  const password = await bcrypt.hash(input.password, SALT_ROUNDS)
  try {
    const users = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${input.name}, ${input.email}, ${password})
      RETURNING *
    `

    return users[0] as User
  } catch (cause) {
    throw new Error('Failed to create user.', { cause })
  }
}
