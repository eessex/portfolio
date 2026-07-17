'use server'

import bcrypt from 'bcrypt'

import { signIn } from '@/auth'
import { sql } from '@/lib/db'
import type { FormResponse } from '@/lib/types'
import type { User } from '@/lib/users/types'

const SALT_ROUNDS = 10

export async function authenticate(
  formData: FormData
): Promise<FormResponse<Record<string, never>>> {
  await signIn('credentials', formData)
  return { ok: true }
}

// This function is currently only called during the initial setup of the app.
// Update this function to validate form data if it is ever called in other contexts.
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
