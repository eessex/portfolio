// Deliberately NOT a server action ('use server' would expose this as
// a public endpoint). User creation is only available to server-side
// scripts — currently scripts/setup.ts.
import bcrypt from 'bcrypt'

import { sql } from '@/lib/db'

const SALT_ROUNDS = 10

export async function createUser(input: {
  name: string
  email: string
  password: string
}): Promise<void> {
  const password = await bcrypt.hash(input.password, SALT_ROUNDS)
  try {
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${input.name}, ${input.email}, ${password})
    `
  } catch (cause) {
    throw new Error('Failed to create user.', { cause })
  }
}
