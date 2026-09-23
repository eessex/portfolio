import { NextResponse } from 'next/server'
import type { z } from 'zod'

import { camelizeKeys } from '@/lib/strings'
import type { EmbeddedItem, PageItemClient } from '@/lib/types'

export const DEFAULT_PAGE_SIZE = 24

export interface ResponseWithCursor<
  T extends EmbeddedItem | PageItemClient
> {
  res: T[]
  nextCursor: string | null
  totalCount: number
}

export type Cursor = {
  [key: string]: string
  id: string
}

export function encodeCursor(cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString('base64')
}

export function decodeCursor(cursor?: string | null): Cursor | null {
  if (!cursor) return null
  try {
    const decodedCursor = Buffer.from(cursor, 'base64').toString(
      'utf8'
    )
    return JSON.parse(decodedCursor)
  } catch {
    return null
  }
}

export function formatResponseWithCursor<T extends z.ZodTypeAny>(
  result: unknown[],
  cursorKey: keyof z.infer<T>,
  schema: T,
  /** extra fields for composite sorts, e.g. a secondary group key */
  cursorExtra?: (lastItem: z.infer<T>) => Record<string, string>
) {
  const formatted: z.infer<T>[] = result.map((row) =>
    formatDbResponseForClient(row, schema)
  )

  const lastItem = formatted[formatted.length - 1]
  const isLoadMoreAvailable =
    formatted.length === DEFAULT_PAGE_SIZE && lastItem?.id != null

  const cursorObj = isLoadMoreAvailable
    ? {
        name: lastItem[cursorKey], // Always encoded as `name`
        id: lastItem.id,
        ...cursorExtra?.(lastItem)
      }
    : null

  const nextCursor = cursorObj ? encodeCursor(cursorObj) : null

  const response: Omit<
    ResponseWithCursor<z.infer<T>>,
    'totalCount'
  > = {
    res: formatted,
    nextCursor
  }
  return response
}

function nullsToUndefined<T>(obj: T): T {
  if (obj === null) return undefined as unknown as T

  if (typeof obj === 'number') return obj as T
  if (typeof obj === 'boolean') return obj as T
  if (typeof obj === 'string') return obj as T
  if (obj instanceof Date) return obj

  if (Array.isArray(obj)) {
    return obj.map(nullsToUndefined) as unknown as T
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        nullsToUndefined(value)
      ])
    ) as T
  }

  return obj
}

export function formatDbResponseForClient<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T
): z.infer<T> {
  const formatted = nullsToUndefined(camelizeKeys(data))
  return schema.parse(formatted)
}

/**
 * Builds a `{ ok: false, message }` response for a caught exception, always
 * surfacing the underlying cause rather than just a generic wrapper message.
 * If `err` is one of our own thrown Errors wrapping an unknown failure (e.g.
 * a raw DB error attached via `{ cause }`), the cause's message is used;
 * otherwise falls back to the error's own message, then to a fully generic
 * message as a last resort.
 */
export function formatErrorResponse(prefix: string, err: unknown) {
  if (!(err instanceof Error)) {
    return { ok: false as const, message: `${prefix}.` }
  }

  const cause = err.cause instanceof Error ? err.cause : err
  return {
    ok: false as const,
    message: `${prefix}: ${cause.message}.`
  }
}

/**
 * Builds a `{ ok: false, errors, message }` response from a failed
 * `schema.safeParse()` result's `ZodError`, for returning per-field
 * validation errors to the form.
 */
export function formatValidationResponse(
  error: z.ZodError,
  message: string
) {
  return {
    ok: false as const,
    errors: error.flatten().fieldErrors,
    message
  }
}

/**
 * Responses that contain unpublished drafts (for authed admins),
 * must never be cached under a key an anonymous request could reach.
 */
export function formatAuthedApiResponseJSON<T>(data: T) {
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'private, no-store' }
  })
}

/**
 * Normalizes raw FormData entries before schema validation. Accepts a
 * FormData instance directly (or an already-extracted object, e.g. when the
 * caller needs to tweak entries first).
 */
export function normalizeFormData(
  data: FormData | Record<string, unknown>
): Record<string, unknown> {
  const normalized =
    data instanceof FormData ? Object.fromEntries(data) : data

  Object.entries(normalized).forEach(([key, value]) => {
    if (value === 'on') {
      // checkboxes are always 'on' when checked, so we convert them to true
      normalized[key] = true
    } else if (key.includes('Date')) {
      normalized[key] = value || undefined
    } else if (value === '') {
      // empty optional fields submit as '' rather than being omitted
      normalized[key] = undefined
    }
  })

  return normalized
}

export type IndexedGroupEntry =
  | { kind: 'existing'; id: string }
  | { kind: 'edited'; id: string; fields: Record<string, unknown> }
  | { kind: 'new'; fields: Record<string, unknown> }

/**
 * Pulls indexed field groups (`${prefix}[0].field`, `${prefix}[1].field`,
 * ...) out of a flat form-data object, e.g. for a reorderable picker that
 * lets a user select existing items by id alongside creating new ones
 * inline. The client side of that naming is `indexedItemFieldPrefix()`
 * in `@/lib/item-fields`. Order is set by the user, returned array
 * preserves that order.
 */
export function extractIndexedGroups(
  data: Record<string, unknown>,
  prefix: string
): IndexedGroupEntry[] {
  const groupPattern = new RegExp(
    `^${prefix}\\[(\\d*)\\](?:\\.(\\w+))?$`
  )
  const groups: Record<number, Record<string, unknown>> = {}

  Object.keys(data).forEach((key) => {
    const match = key.match(groupPattern)
    if (!match) return

    const [, indexStr, field] = match
    if (indexStr !== '' && field) {
      const index = Number(indexStr)
      groups[index] ??= {}
      groups[index][field] = data[key]
    }
    delete data[key]
  })

  return Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b)
    .map((index): IndexedGroupEntry => {
      const group = groups[index]
      if (typeof group.id === 'string') {
        const { id, ...fields } = group
        // An id alongside edited fields means an existing item was
        // opened and changed inline. id alone is an untouched selection.
        return Object.keys(fields).length > 0
          ? { kind: 'edited', id, fields }
          : { kind: 'existing', id }
      }
      return { kind: 'new', fields: group }
    })
}

/**
 * The single-item counterpart of `extractIndexedGroups`: pulls one
 * picker slot's fields (`${prefix}field`, e.g. `venue.city`) out of a
 * flat form-data object and classifies it the same way.
 *
 * An id alongside fields is an inline edit, an id alone an untouched
 * selection, fields alone a pending creation.
 * Returns `undefined` when the picker submitted nothing at all.
 */
export function extractPrefixedGroup(
  data: Record<string, unknown>,
  prefix: string,
  idFieldName: string
): IndexedGroupEntry | undefined {
  const fields: Record<string, unknown> = {}

  Object.keys(data).forEach((key) => {
    if (!key.startsWith(prefix)) return
    fields[key.slice(prefix.length)] = data[key]
    delete data[key]
  })

  const id = data[idFieldName]
  if (typeof id === 'string' && id) {
    return Object.keys(fields).length > 0
      ? { kind: 'edited', id, fields }
      : { kind: 'existing', id }
  }
  return Object.keys(fields).length > 0
    ? { kind: 'new', fields }
    : undefined
}

function isBlankValue(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (value instanceof File) return value.size === 0
  return false
}

export function isBlankEntry(
  fields: Record<string, unknown>
): boolean {
  return Object.values(fields).every(isBlankValue)
}
