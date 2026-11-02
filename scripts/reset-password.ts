/**
 * Last-resort account recovery: prints a one-time reset link for an
 * admin who lost both their password and recovery codes, with no other
 * admin to create one from the Users page.
 *
 *   pnpm run reset-password <email> [--url https://your-site.com]
 *
 * Needs the site's DATABASE_URL, from .env or the environment:
 *
 *   DATABASE_URL='postgres://…' pnpm run reset-password you@example.com
 *
 * The link's base is --url, else AUTH_URL; with neither, it prints
 * `<your site>/reset-password#…` to fill in. It's the same link the
 * Users page creates: single use, expiring after USER_TOKEN_TTL_HOURS,
 * replacing the account's earlier reset link, and void once its
 * password or email changes. Whoever opens it chooses the password, so
 * running this for someone else never tells you theirs. The token is
 * printed only here; it isn't recoverable from the database.
 */
import { USER_TOKEN_TTL_HOURS } from '@/lib/users/schemas'

const USAGE =
  'Usage: pnpm run reset-password <email> [--url https://your-site.com]'

function parseArgs(args: string[]) {
  const urlIndex = args.indexOf('--url')
  const url = urlIndex === -1 ? undefined : args[urlIndex + 1]
  const positional = args.filter(
    (_arg, i) =>
      urlIndex === -1 || (i !== urlIndex && i !== urlIndex + 1)
  )
  return {
    email: positional[0],
    url,
    isUrlMissing: urlIndex !== -1 && !url
  }
}

async function main(): Promise<number> {
  const { email, url, isUrlMissing } = parseArgs(
    process.argv.slice(2)
  )
  if (!email || email.startsWith('--') || isUrlMissing) {
    console.error(USAGE)
    return 1
  }
  if (!process.env.DATABASE_URL) {
    console.error(
      `❌ DATABASE_URL isn't set. Add it to .env or pass it inline:\n  DATABASE_URL='postgres://…' pnpm run reset-password ${email}`
    )
    return 1
  }

  // Imported after the env check, since @/lib/db throws without it
  const { issueResetLink, normalizeBaseUrl } =
    await import('./reset-password/issue-reset-link')
  const rawBase = url ?? process.env.AUTH_URL
  const baseUrl = rawBase ? normalizeBaseUrl(rawBase) : undefined
  if (rawBase && !baseUrl) {
    console.error(`❌ Not a site address: ${rawBase}`)
    return 1
  }

  const result = await issueResetLink(email, baseUrl)
  if (!result.ok) {
    console.error(`❌ ${result.message}`)
    return 1
  }
  console.log(
    [
      `✅ Reset link for ${result.name} (${email}):`,
      '',
      `  ${result.link}`,
      '',
      `It works once, until ${result.expiresAt.toISOString()} (${USER_TOKEN_TTL_HOURS} hours).`,
      ...(baseUrl
        ? []
        : ['Replace <your site> with the site’s address.']),
      'Send it privately: anyone with it can set this account’s password.',
      'After signing in, generate new recovery codes from the dashboard.'
    ].join('\n')
  )
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error(
      `❌ ${error instanceof Error ? error.message : String(error)}`
    )
    process.exit(1)
  })
