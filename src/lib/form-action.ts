import type { z } from 'zod'

import { requireAuth } from '@/lib/auth/guard'
import type { ItemType } from '@/lib/schemas'
import { itemTypeToLabel } from '@/lib/schemas'
import type { FormResponse, FormState } from '@/lib/types'
import {
  formatErrorResponse,
  formatValidationResponse,
  normalizeFormData
} from '@/lib/util'

/**
 * Shared frame for `'use server'` form mutations: session check,
 * FormData normalization, Zod validation, cache invalidation and
 * error formatting, so each domain's actions.ts only supplies its
 * SQL and cache tags. Deliberately not a `'use server'` module —
 * only the domain actions that call these helpers are exposed as
 * action endpoints.
 */

interface RunFormActionOptions<S extends z.ZodTypeAny, T> {
  formData: FormData
  /** validates the (normalized) form entries */
  schema: S
  itemType: ItemType
  /** set false for schemas that expect raw form entries */
  isNormalized?: boolean
  /**
   * Runs after the auth check, before validation; may replace
   * entries (e.g. swapping an uploaded file for its S3 url). Thrown
   * errors are logged and returned as a `{ ok: false }` response (same
   * as a failed `save`), so a failed upload surfaces as a form error
   * rather than a masked server-action rejection.
   */
  prepare?: (
    data: Record<string, unknown>
  ) => Promise<Record<string, unknown>>
  /** performs the DB write; return the saved entity to send as `res` */
  save: (data: z.output<S>) => Promise<T | void>
  /** cache invalidation, called only after a successful save */
  invalidate: (saved?: T) => void
}

export async function runFormAction<S extends z.ZodTypeAny, T>({
  formData,
  schema,
  itemType,
  isNormalized = true,
  prepare,
  save,
  invalidate
}: RunFormActionOptions<S, T>): Promise<FormResponse<T>> {
  const denied = await requireAuth()
  if (denied) return denied

  let data: Record<string, unknown> = Object.fromEntries(formData)
  if (prepare) {
    try {
      data = await prepare(data)
    } catch (err) {
      console.error(`Failed to prepare ${itemType}:`, err)
      return formatErrorResponse(
        `Failed to save ${itemTypeToLabel(itemType, true, true)}`,
        err
      )
    }
  }

  const validated = schema.safeParse(
    isNormalized ? normalizeFormData(data) : data
  )

  if (!validated.success) {
    return formatValidationResponse(
      validated.error,
      `Failed to validate ${itemTypeToLabel(itemType, true, true)}.`
    )
  }

  try {
    const saved = (await save(validated.data)) ?? undefined
    invalidate(saved)
    return saved ? { ok: true, res: saved } : { ok: true }
  } catch (err) {
    return formatErrorResponse(
      `Failed to save ${itemTypeToLabel(itemType, true, true)}`,
      err
    )
  }
}

interface RunDeleteActionOptions<T> {
  itemType: ItemType
  /** performs the delete; return a FormState to short-circuit (e.g. not found) */
  del: () => Promise<FormState<T> | void>
  /** cache invalidation, called only after a successful delete */
  invalidate: () => void
}

export async function runDeleteAction<T>({
  itemType,
  del,
  invalidate
}: RunDeleteActionOptions<T>): Promise<FormResponse<T>> {
  const denied = await requireAuth()
  if (denied) return denied

  try {
    const failed = await del()
    if (failed) return failed
    invalidate()
    return { ok: true }
  } catch (err) {
    return formatErrorResponse(
      `Failed to delete ${itemTypeToLabel(itemType, true, true)}`,
      err
    )
  }
}
