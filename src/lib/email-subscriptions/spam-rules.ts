import disposableDomains from '@/lib/email-subscriptions/disposable-domains.json'
import type { SpamReason } from '@/lib/email-subscriptions/spam-reasons'

const disposable = new Set<string>(disposableDomains)
const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com'])
// Gmail ignores dots, so bots pad one inbox into many addresses;
// people rarely type more than two
const MAX_GMAIL_DOTS = 2
// e.g. Libbie493_Koelpin1998, Raymundo527_Bernhard.1980
const GENERATED_NAME = /^[a-z]+\d{2,4}[._][a-z]+\.?\d{4}$/i

/** The domain and each parent, so subdomains of a listed one match */
function domainAndParents(domain: string) {
  const parts = domain.split('.')
  return parts.slice(0, -1).map((_, i) => parts.slice(i).join('.'))
}

/**
 * The first rule a subscriber's email trips, or `null`. A flag, not
 * a verdict: flagged rows are kept as spam an admin can undo.
 */
export function suspiciousReason(
  rawEmail: string
): SpamReason | null {
  const email = rawEmail.trim().toLowerCase()
  const at = email.lastIndexOf('@')
  if (at < 1) return null
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)

  if (GMAIL_DOMAINS.has(domain)) {
    const dots = local.split('+')[0]?.split('.').length ?? 1
    if (dots - 1 > MAX_GMAIL_DOTS) return 'gmail-dots'
  }
  if (domainAndParents(domain).some((d) => disposable.has(d))) {
    return 'disposable-domain'
  }
  if (GENERATED_NAME.test(local)) return 'generated-name'
  return null
}
