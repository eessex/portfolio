import type { QueryResult } from '@vercel/postgres'
import type { z } from 'zod'

import { camelizeKeys } from '@/ui/util'

export const DEFAULT_PAGE_SIZE = 24

export interface ResponseWithCursor<T> {
  res: T[]
  nextCursor: string | null
  totalCount: number
}

type Cursor = {
  name: string
  id: string
}

export function encodeCursor (cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString('base64')
}

export function decodeCursor (cursor?: string | null): Cursor | null {
  if (!cursor) return null
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

export function formatResponseWithCursor<T extends z.ZodTypeAny> (
  result: QueryResult,
  cursorKey: keyof z.infer<T>,
  schema: T
) {
  const formatted = result.rows.map(row => formatDbResponseForClient(row, schema))
  const lastItem = result.rows[result.rows.length - 1]

  const nextCursor =
    formatted.length === DEFAULT_PAGE_SIZE && lastItem?.[cursorKey] && lastItem?.id
      ? encodeCursor({
        name: lastItem[cursorKey], id: lastItem.id
      })
      : null

  const response: Omit<ResponseWithCursor<z.infer<T>>, 'totalCount'> = {
    res: formatted,
    nextCursor
  }
  return response
}

function nullsToUndefined<T> (obj: T): T {
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
      Object.entries(obj).map(([key, value]) => [key, nullsToUndefined(value)])
    ) as T
  }

  return obj
}

export function formatDbResponseForClient<T extends z.ZodTypeAny> (
  data: unknown,
  schema: T
): z.infer<T> {
  const formatted = nullsToUndefined(camelizeKeys(data))
  return schema.parse(formatted)
}
