import { generateUserToken } from '@/lib/auth/user-token'
import { sql } from '@/lib/db'
import { createResetToken } from '@/lib/users/tokens'

// Matches src/ui/users/one-time-link.tsx's RESET_PASSWORD_PATH; that
// module is a client component, so it isn't imported here
export const RESET_PASSWORD_PATH = '/reset-password'

export type ResetLinkResult =
  | { ok: true; name: string; link: string; expiresAt: Date }
  | { ok: false; message: string }

/** `https://site.com/` → `https://site.com`; `undefined` when invalid */
export function normalizeBaseUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return undefined
    }
    return url.origin
  } catch {
    return undefined
  }
}

/**
 * The same one-time reset link the Users page creates, for an admin
 * with no other admin to create it. The account is recorded as its
 * own link's creator, since `created_by` is required.
 */
export async function issueResetLink(
  email: string,
  baseUrl: string | undefined
): Promise<ResetLinkResult> {
  // Emails are unique regardless of case (idx_users_email_lower)
  const users = await sql`
    SELECT id, name, session_version FROM users
    WHERE lower(email) = lower(${email.trim()})
    LIMIT 1
  `
  const user = users[0]
  if (!user) {
    const admins = await sql`SELECT email FROM users ORDER BY email`
    const list = admins.map((row) => `  ${row.email}`).join('\n')
    return {
      ok: false,
      message: list
        ? `No admin has the email ${email}. Admins:\n${list}`
        : `No admin has the email ${email}, and none exist yet: claim the site at /setup instead.`
    }
  }

  const { token, hash } = generateUserToken()
  const id = user.id as string
  const expiresAt = await createResetToken(
    id,
    user.session_version as number,
    id,
    hash
  )
  if (expiresAt === 'stale' || expiresAt === 'gone') {
    return {
      ok: false,
      message:
        'That account changed while the link was being created. Run the command again.'
    }
  }
  return {
    ok: true,
    name: user.name as string,
    link: `${baseUrl ?? '<your site>'}${RESET_PASSWORD_PATH}#${token}`,
    expiresAt
  }
}
