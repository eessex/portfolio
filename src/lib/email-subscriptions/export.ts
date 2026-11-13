import { sql } from '@/lib/db'
import type { ExportScope } from '@/lib/email-subscriptions/types'

export interface ExportRow {
  email: string
  created_at: Date | string
}

const CSV_HEADER = ['email', 'subscribed_at']
// Excel otherwise guesses the encoding
const UTF8_BOM = '\uFEFF'

/** RFC 4180 quoting, plus a guard against spreadsheet formulas */
export function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(safe)
    ? `"${safe.replace(/"/g, '""')}"`
    : safe
}

export function subscribersToCsv(rows: ExportRow[]) {
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  )
  const lines = [
    CSV_HEADER.join(','),
    ...sorted.map((row) =>
      [row.email, new Date(row.created_at).toISOString()]
        .map(csvCell)
        .join(',')
    )
  ]
  return UTF8_BOM + lines.join('\r\n') + '\r\n'
}

export function exportFilename(scope: ExportScope, now = new Date()) {
  return `subscribers-${scope}-${now.toISOString().slice(0, 10)}.csv`
}

/**
 * Stamps, records and returns an export in one statement, so a
 * subscriber arriving mid-export is either in this file or the next,
 * and the export is recorded whenever its rows were stamped, even if
 * the response is lost. Spam rows are never returned.
 */
export async function selectAndStampExport(
  scope: ExportScope,
  exportId: string
): Promise<ExportRow[]> {
  return (await sql`
    WITH stamped AS (
      UPDATE email_subscriptions
      SET exported_at = current_timestamp,
        updated_at = current_timestamp
      WHERE NOT is_spam
        AND (${scope} = 'all' OR exported_at IS NULL)
      RETURNING email, created_at
    ), recorded AS (
      INSERT INTO email_subscription_exports
        (id, scope, subscriber_count)
      SELECT ${exportId}, ${scope}, count(*) FROM stamped
      HAVING count(*) > 0
    )
    SELECT email, created_at FROM stamped
  `) as ExportRow[]
}
