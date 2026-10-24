import type { z } from 'zod'

import { assertAuthed, requireAuth } from '@/lib/auth/guard'
import { itemFieldPrefix } from '@/lib/item-fields'
import type { ItemType } from '@/lib/schemas'
import { itemTypeToLabel } from '@/lib/schemas'
import type { FormResponse, FormState } from '@/lib/types'
import {
  extractIndexedGroups,
  extractPrefixedGroup,
  formatErrorResponse,
  formatValidationResponse,
  isBlankEntry,
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
   * entries (e.g. swapping an uploaded file for its stored url). Thrown
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

interface SaveItemFromFieldsOptions<S extends z.ZodTypeAny, T> {
  /** present → update that row; absent → create a new one */
  id?: string
  /** the raw (unnormalized) field group */
  fields: Record<string, unknown>
  /** validates the (normalized) fields */
  schema: S
  /** names the item in the thrown `Invalid <item> data` message */
  itemType: ItemType
  /**
   * Optional pre-validation work (e.g. file upload, metadata fetch),
   * receiving the `id` so edit-time behavior can differ from create.
   */
  prepare?: (
    fields: Record<string, unknown>,
    id?: string
  ) => Record<string, unknown> | Promise<Record<string, unknown>>
  create: (data: z.output<S>) => Promise<T>
  update: (data: z.output<S>, id: string) => Promise<T>
}

/**
 * normalize → validate → save pipeline for a single item embedded
 * via another domain's multi-item picker: accepts raw data (not FormData).
 * Creates when `id` is absent, updates when present. Session-checked
 * here rather than relying on the parent action: each domain's
 * `save*FromFields` wrapper is itself an exposed server action.
 */
export async function saveItemFromFields<S extends z.ZodTypeAny, T>({
  id,
  fields,
  schema,
  itemType,
  prepare,
  create,
  update
}: SaveItemFromFieldsOptions<S, T>): Promise<T> {
  await assertAuthed()
  const prepared = prepare ? await prepare(fields, id) : fields
  const parsed = schema.safeParse(normalizeFormData(prepared))
  if (!parsed.success) {
    throw new Error(
      `Invalid ${itemTypeToLabel(itemType, true, true)} data: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(', ')}`
    )
  }
  return id ? update(parsed.data, id) : create(parsed.data)
}

/**
 * Saves one picker entry's submitted fields, creating or updating as
 * the entry's kind requires.
 */
type SaveFromFields<T extends { id: string }> = (
  fields: Record<string, unknown>,
  id?: string
) => Promise<T>

/**
 * Resolves a single-item picker's submission into an item id: an
 * untouched selection passes its id through, an inline edit UPDATEs,
 * a pending creation INSERTs, and an untouched blank create form
 * resolves to `undefined`. Mutates `data`, removing the entry's fields
 * so they don't reach the parent form's own schema validation.
 *
 * Both the id field it reads and the prefix it strips come from
 * `idFieldName` (`coverImageId` -> `coverImage.`), the same pair
 * `ItemPicker` renders from — see `@/lib/item-fields`.
 */
export async function resolveItemId<T extends { id: string }>(
  data: Record<string, unknown>,
  idFieldName: string,
  save: SaveFromFields<T>
): Promise<string | undefined> {
  const entry = extractPrefixedGroup(
    data,
    itemFieldPrefix(idFieldName),
    idFieldName
  )
  if (!entry) return undefined
  if (entry.kind === 'existing') return entry.id
  if (entry.kind === 'edited') {
    const item = await save(entry.fields, entry.id)
    return item.id
  }
  // an opened-but-untouched create form submits blank fields
  if (isBlankEntry(entry.fields)) return undefined
  const item = await save(entry.fields)
  return item.id
}

/**
 * Resolves a reorderable multi picker's submitted entries (a mix of
 * existing selections, inline edits of attached items, and pending
 * inline creations, in the user's chosen order — see
 * `extractIndexedGroups`) into an ordered list of ids. Untouched blank
 * create forms are dropped rather than saved.
 */
export async function resolveOrderedIds<T extends { id: string }>(
  data: Record<string, unknown>,
  name: string,
  save: SaveFromFields<T>
): Promise<string[]> {
  const entries = extractIndexedGroups(data, name).filter(
    (entry) => entry.kind !== 'new' || !isBlankEntry(entry.fields)
  )
  return Promise.all(
    entries.map((entry) =>
      entry.kind === 'existing'
        ? entry.id
        : save(
            entry.fields,
            entry.kind === 'edited' ? entry.id : undefined
          ).then((item) => item.id)
    )
  )
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
