import { sql } from '@/lib/db'
import { storedEmailSubscriptionSchema } from '@/lib/email-subscriptions/schemas'
import type { EmailSubscriptionsPage } from '@/lib/email-subscriptions/types'
import { formatDbResponseForClient } from '@/lib/util'

export const SUBSCRIBERS_PAGE_SIZE = 50

/** `?page` → a 1-based page number; anything else is page 1 */
export function parsePageParam(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value
  const page = Number(raw)
  return Number.isInteger(page) && page > 0 ? page : 1
}

/**
 * One numbered page each of new (never exported), exported and spam
 * subscribers, newest first, plus the counts the export buttons show.
 * A page past the end clamps to the last. Offset paging (not the
 * cursor convention) so any page can be linked directly.
 */
export async function fetchEmailSubscriptionsPage(
  {
    page: requestedPage = 1,
    exportedPage: requestedExportedPage = 1,
    spamPage: requestedSpamPage = 1
  }: {
    page?: number
    exportedPage?: number
    spamPage?: number
  } = {},
  pageSize = SUBSCRIBERS_PAGE_SIZE
): Promise<EmailSubscriptionsPage> {
  // one statement, so one snapshot: a subscriber moved mid-read (an
  // export, a spam toggle) can't show in two tables or none, and the
  // counts are taken once for both the buttons and the page clamps
  let rows
  try {
    rows = (await sql`
      WITH counts AS (
        SELECT
          count(*) FILTER (
            WHERE exported_at IS NULL AND NOT is_spam
          )::int AS unexported_count,
          count(*) FILTER (
            WHERE exported_at IS NOT NULL AND NOT is_spam
          )::int AS exported_count,
          count(*) FILTER (WHERE is_spam)::int AS spam_count
        FROM email_subscriptions
      ),
      offsets AS (
        -- numeric until clamped, so a huge ?page can't overflow int
        SELECT
          (GREATEST(1, LEAST(
            ${requestedPage}::numeric,
            ceil(unexported_count / ${pageSize}::numeric)
          ))::int - 1) * ${pageSize}::int AS new_offset,
          (GREATEST(1, LEAST(
            ${requestedExportedPage}::numeric,
            ceil(exported_count / ${pageSize}::numeric)
          ))::int - 1) * ${pageSize}::int AS exported_offset,
          (GREATEST(1, LEAST(
            ${requestedSpamPage}::numeric,
            ceil(spam_count / ${pageSize}::numeric)
          ))::int - 1) * ${pageSize}::int AS spam_offset
        FROM counts
      ),
      new_page AS (
        SELECT 'new' AS list_kind, id, email, exported_at, is_spam,
          spam_reason, is_spam_reviewed, created_at, updated_at
        FROM email_subscriptions
        WHERE exported_at IS NULL AND NOT is_spam
        ORDER BY created_at DESC, id DESC
        LIMIT ${pageSize}
        OFFSET (SELECT new_offset FROM offsets)
      ),
      exported_page AS (
        SELECT 'exported' AS list_kind, id, email, exported_at, is_spam,
          spam_reason, is_spam_reviewed, created_at, updated_at
        FROM email_subscriptions
        WHERE exported_at IS NOT NULL AND NOT is_spam
        ORDER BY created_at DESC, id DESC
        LIMIT ${pageSize}
        OFFSET (SELECT exported_offset FROM offsets)
      ),
      spam_page AS (
        SELECT 'spam' AS list_kind, id, email, exported_at, is_spam,
          spam_reason, is_spam_reviewed, created_at, updated_at
        FROM email_subscriptions
        WHERE is_spam
        ORDER BY created_at DESC, id DESC
        LIMIT ${pageSize}
        OFFSET (SELECT spam_offset FROM offsets)
      ),
      pages AS (
        SELECT * FROM new_page
        UNION ALL SELECT * FROM exported_page
        UNION ALL SELECT * FROM spam_page
      )
      -- the counts row survives with no subscribers at all
      SELECT counts.*, pages.*
      FROM counts LEFT JOIN pages ON true
      ORDER BY pages.list_kind, pages.created_at DESC, pages.id DESC
    `) as Record<string, unknown>[]
  } catch (cause) {
    throw new Error('Failed to fetch subscribers.', { cause })
  }

  const first = rows[0] ?? {}
  const unexportedCount = Number(first.unexported_count ?? 0)
  const exportedCount = Number(first.exported_count ?? 0)
  const spamCount = Number(first.spam_count ?? 0)
  // the same clamp the query applied, from the same counts
  const pageCount = countPages(unexportedCount, pageSize)
  const page = clampPage(requestedPage, pageCount)
  const exportedPageCount = countPages(exportedCount, pageSize)
  const exportedPage = clampPage(
    requestedExportedPage,
    exportedPageCount
  )
  const spamPageCount = countPages(spamCount, pageSize)
  const spamPage = clampPage(requestedSpamPage, spamPageCount)

  const listed = (kind: ListKind) =>
    rows.filter((row) => row.list_kind === kind).map(toClient)

  return {
    items: listed('new'),
    page,
    pageCount,
    activeCount: unexportedCount + exportedCount,
    unexportedCount,
    exportedItems: listed('exported'),
    exportedPage,
    exportedPageCount,
    exportedCount,
    spamItems: listed('spam'),
    spamPage,
    spamPageCount,
    spamCount
  }
}

type ListKind = 'new' | 'exported' | 'spam'

/** The page CTEs' columns, picked from each joined row */
const listColumnNames = [
  'id',
  'email',
  'exported_at',
  'is_spam',
  'spam_reason',
  'is_spam_reviewed',
  'created_at',
  'updated_at'
] as const

function toClient(row: Record<string, unknown>) {
  const item = Object.fromEntries(
    listColumnNames.map((name) => [name, row[name]])
  )
  return formatDbResponseForClient(
    item,
    storedEmailSubscriptionSchema
  )
}

function countPages(count: number, pageSize: number) {
  return Math.max(1, Math.ceil(count / pageSize))
}

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(1, page), pageCount)
}
