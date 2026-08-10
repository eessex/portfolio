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
  } catch (cause) {
    throw new Error('Failed to fetch user.', { cause })
  }
}

export async function countUsers(): Promise<number> {
  try {
    const rows = await sql`SELECT count(*)::int AS count FROM users`
    return (rows[0]?.count as number) ?? 0
  } catch (cause) {
    throw new Error('Failed to count users.', { cause })
  }
}
