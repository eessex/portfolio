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
  schema: T
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
        id: lastItem.id
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
