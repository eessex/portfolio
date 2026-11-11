'use server'

import { z } from 'zod'

import { currentUserId, requireAuth } from '@/lib/auth/guard'
import { sql } from '@/lib/db'
import {
  exportFilename,
  selectAndStampExport,
  selectExportBatch,
  subscribersToCsv
} from '@/lib/email-subscriptions/export'
import { exportScopeSchema } from '@/lib/email-subscriptions/schemas'
import { suspiciousReason } from '@/lib/email-subscriptions/spam-rules'
import type { ExportScope } from '@/lib/email-subscriptions/types'
import { uuid } from '@/lib/schemas/primitives'
import type { FormResponse } from '@/lib/types'
import {
  formatErrorResponse,
  formatValidationResponse
} from '@/lib/util'

export interface SubscribersExport {
  csv: string
  filename: string
  count: number
}

/**
 * Builds a CSV of non-spam subscribers, marking them exported and
 * recording the export in the same statement. A lost response or
 * download is recovered from the recent exports list.
 */
export async function exportEmailSubscriptions(
  scope: ExportScope
): Promise<FormResponse<SubscribersExport>> {
  const denied = await requireAuth()
  if (denied) return denied

  const parsed = exportScopeSchema.safeParse(scope)
  if (!parsed.success) {
    return formatValidationResponse(parsed.error, 'Invalid export.')
  }

  const batchId = crypto.randomUUID()
  try {
    const rows = await selectAndStampExport(scope, batchId)
    // no emails in logs
    console.info('exportEmailSubscriptions', {
      scope,
      batchId,
      count: rows.length,
      userId: await currentUserId()
    })
    return {
      ok: true,
      res: {
        csv: subscribersToCsv(rows),
        filename: exportFilename(scope),
        count: rows.length
      }
    }
  } catch (err) {
    console.error('exportEmailSubscriptions failed', err)
    return formatErrorResponse('Failed to export subscribers', err)
  }
}

/** A past 'new' export's CSV again, stamping nothing */
export async function downloadSubscribersExport(
  batchId: string
): Promise<FormResponse<SubscribersExport>> {
  const denied = await requireAuth()
  if (denied) return denied

  const parsed = uuid.safeParse(batchId)
  if (!parsed.success) {
    return formatValidationResponse(parsed.error, 'Invalid export.')
  }

  try {
    const batch = await selectExportBatch(batchId)
    if (!batch) return { ok: false, message: 'Export not found.' }
    console.info('downloadSubscribersExport', {
      batchId,
      count: batch.rows.length,
      userId: await currentUserId()
    })
    return {
      ok: true,
      res: {
        csv: subscribersToCsv(batch.rows),
        filename: exportFilename('new', batch.createdAt),
        count: batch.rows.length
      }
    }
  } catch (err) {
    console.error('downloadSubscribersExport failed', err)
    return formatErrorResponse('Failed to download the export', err)
  }
}

/** Spam rows stay listed but are left out of every export */
export async function setEmailSubscriptionSpam(
  id: string,
  isSpam: boolean
): Promise<FormResponse<never>> {
  const denied = await requireAuth()
  if (denied) return denied

  const parsed = z
    .object({ id: uuid, isSpam: z.boolean() })
    .safeParse({ id, isSpam })
  if (!parsed.success) {
    return formatValidationResponse(
      parsed.error,
      'Invalid subscriber.'
    )
  }

  try {
    const rows = await sql`
      UPDATE email_subscriptions
      SET is_spam = ${isSpam}, spam_reason = NULL,
        is_spam_reviewed = true, updated_at = current_timestamp
      WHERE id = ${id}
      RETURNING id
    `
    if (rows.length === 0) {
      return { ok: false, message: 'Subscriber not found.' }
    }
    return {
      ok: true,
      message: isSpam ? 'Marked as spam.' : 'Marked as not spam.'
    }
  } catch (err) {
    return formatErrorResponse('Failed to update subscriber', err)
  }
}

const FLAG_BATCH_SIZE = 1000

/**
 * Runs the spam rules over subscribers no admin has reviewed yet and
 * marks the matches as spam, with their reason. Returns how many.
 * Rescans rows it found clean before, since the rules (and the
 * disposable-domain list) change; new subscribers are checked on
 * insert.
 */
export async function flagSuspiciousSubscriptions(): Promise<
  FormResponse<{ count: number }>
> {
  const denied = await requireAuth()
  if (denied) return denied

  try {
    let count = 0
    let afterId: string | null = null
    // in pages, so a large list never sits in memory at once
    for (;;) {
      const rows = (await sql`
        SELECT id, email FROM email_subscriptions
        WHERE NOT is_spam AND NOT is_spam_reviewed
          AND (${afterId}::uuid IS NULL OR id > ${afterId}::uuid)
        ORDER BY id
        LIMIT ${FLAG_BATCH_SIZE}
      `) as { id: string; email: string }[]

      const ids: string[] = []
      const reasons: string[] = []
      for (const row of rows) {
        const reason = suspiciousReason(row.email)
        if (reason) {
          ids.push(row.id)
          reasons.push(reason)
        }
      }

      if (ids.length > 0) {
        // guards repeat the SELECT's, in case an admin acted meanwhile
        const updated = await sql`
          UPDATE email_subscriptions e
          SET is_spam = true, spam_reason = v.reason,
            updated_at = current_timestamp
          FROM unnest(${ids}::uuid[], ${reasons}::text[])
            AS v(id, reason)
          WHERE e.id = v.id AND NOT e.is_spam
            AND NOT e.is_spam_reviewed
          RETURNING e.id
        `
        count += updated.length
      }

      const last = rows.at(-1)
      if (!last || rows.length < FLAG_BATCH_SIZE) break
      afterId = last.id
    }
    return {
      ok: true,
      res: { count },
      message:
        count === 0
          ? 'No suspicious subscribers found.'
          : `Flagged ${count} as spam.`
    }
  } catch (err) {
    return formatErrorResponse('Failed to flag subscribers', err)
  }
}
