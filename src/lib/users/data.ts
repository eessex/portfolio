import { sql } from '@/lib/db'
import type { User } from '@/lib/users/types'

export async function fetchUserByEmail(
  email: string
): Promise<User | null> {
  try {
    const users = await sql`
      SELECT * FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    return (users[0] as User) ?? null
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch user.')
  }
}
