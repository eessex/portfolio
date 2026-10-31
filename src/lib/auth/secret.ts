// Deliberately NOT a server action ('use server' would expose the
// secret as a public endpoint).
import { sql } from '@/lib/db'

let storedSecret: string | undefined

/**
 * The session secret: `AUTH_SECRET` when set, else the instance's own
 * `auth_secret` row (written by the every-deploy `ensureAuthSecret`),
 * read once per server instance. Throws instead of falling back to a
 * random value, which would log everyone out on every cold start.
 */
export async function authSecret(): Promise<string> {
  const envSecret = process.env.AUTH_SECRET
  if (envSecret) return envSecret
  if (storedSecret) return storedSecret

  const rows = await sql`
    SELECT value FROM instance_secrets WHERE name = 'auth_secret'
  `
  const value: unknown = rows[0]?.value
  if (typeof value !== 'string' || !value) {
    throw new Error(
      'No auth secret: set AUTH_SECRET or run `pnpm migrate`'
    )
  }
  storedSecret = value
  return value
}
