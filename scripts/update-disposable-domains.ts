/**
 * Refreshes the vendored disposable-email domain list from
 * github.com/disposable-email-domains/disposable-email-domains.
 * Usage: pnpm run update-disposable-domains
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SOURCE =
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf'
const OUT = join(
  __dirname,
  '../src/lib/email-subscriptions/disposable-domains.json'
)

async function main() {
  const res = await fetch(SOURCE)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const domains = [
    ...new Set(
      (await res.text())
        .split('\n')
        .map((line) => line.trim().toLowerCase())
        .filter((line) => line && !line.startsWith('#'))
    )
  ].sort()
  writeFileSync(OUT, JSON.stringify(domains, null, 2) + '\n')
  console.log(`Wrote ${domains.length} domains to ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
