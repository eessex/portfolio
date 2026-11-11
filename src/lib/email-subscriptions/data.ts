import { sql } from '@/lib/db'
import {
  storedEmailSubscriptionSchema,
  subscribersExportRecordSchema
} from '@/lib/email-subscriptions/schemas'
import type { EmailSubscriptionsPage } from '@/lib/email-subscriptions/types'
import { formatDbResponseForClient } from '@/lib/util'

export const SUBSCRIBERS_PAGE_SIZE = 50
export const RECENT_EXPORTS_LIMIT = 10

/** `?page` → a 1-based page number; anything else is page 1 */
export function parsePageParam(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value
  const page = Number(raw)
  return Number.isInteger(page) && page > 0 ? page : 1
}

/**
 * One numbered page of subscribers, newest first, plus the counts
 * the export buttons show and the most recent exports. A page past the end clamps to the last.
 * Offset paging (not the cursor convention) so any page can be
 * linked directly.
 */
export async function fetchEmailSubscriptionsPage(
  requestedPage: number,
  pageSize = SUBSCRIBERS_PAGE_SIZE
): Promise<EmailSubscriptionsPage> {
  let counts
  try {
    counts = await sql`
      SELECT
        count(*)::int AS total_count,
        count(*) FILTER (
          WHERE exported_at IS NULL AND NOT is_spam
        )::int AS unexported_count,
        count(*) FILTER (WHERE is_spam)::int AS spam_count
      FROM email_subscriptions
    `
  } catch (cause) {
    throw new Error('Failed to count subscribers.', { cause })
  }

  const row = counts[0] ?? {}
  const totalCount = Number(row.total_count ?? 0)
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const page = Math.min(Math.max(1, requestedPage), pageCount)

  let rows
  try {
    rows = await sql`
      SELECT id, email, exported_at, is_spam, spam_reason,
        is_spam_reviewed, created_at, updated_at
      FROM email_subscriptions
      ORDER BY created_at DESC, id DESC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `
  } catch (cause) {
    throw new Error('Failed to fetch subscribers.', { cause })
  }

  let exports
  try {
    exports = await sql`
      SELECT id, scope, subscriber_count, created_at
      FROM email_subscription_exports
      ORDER BY created_at DESC
      LIMIT ${RECENT_EXPORTS_LIMIT}
    `
  } catch (cause) {
    throw new Error('Failed to fetch recent exports.', { cause })
  }

  return {
    recentExports: exports.map((r) =>
      formatDbResponseForClient(r, subscribersExportRecordSchema)
    ),
    items: rows.map((r) =>
      formatDbResponseForClient(r, storedEmailSubscriptionSchema)
    ),
    page,
    pageCount,
    totalCount,
    unexportedCount: Number(row.unexported_count ?? 0),
    spamCount: Number(row.spam_count ?? 0)
  }
}
