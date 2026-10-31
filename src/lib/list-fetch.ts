import type { z } from 'zod'

import type { ItemType } from '@/lib/schemas'
import { itemTypeToLabel } from '@/lib/schemas'
import type { Cursor } from '@/lib/util'
import { decodeCursor, formatResponseWithCursor } from '@/lib/util'

/**
 * Shared frame for cursor-paginated list fetchers: total count,
 * cursor decoding, page formatting and error labelling, so each
 * domain's data.ts only supplies its hand-written SQL. The count
 * query always runs before the page query (tests mocking `sql`
 * rely on the order), and each query keeps its own labelled error.
 */

export interface ListSqlParams {
  /** ILIKE pattern for `query`, or null when unfiltered */
  like: string | null
  /** decoded cursor sort value (always encoded as `name`), or null */
  cursorName: string | null
  /** decoded cursor row id, or null */
  cursorId: string | null
  /** full decoded cursor, for bespoke cursor fields */
  cursor: Cursor | null
}

type Row = Record<string, unknown>

/** Escapes LIKE metacharacters; backslash is the default ESCAPE */
export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

interface RunListFetchOptions<
  S extends z.ZodType<{ id?: string }>,
  R
> {
  cursor?: string
  query?: string
  itemType: ItemType
  /** validates/parses each returned row */
  schema: S
  /** row field encoded into the next-page cursor */
  cursorKey: keyof z.infer<S>
  /** extra fields for composite sorts, e.g. a secondary group key */
  cursorExtra?: (lastItem: z.infer<S>) => Record<string, string>
  /** COUNT query over the same WHERE as `list` */
  count: (like: string | null) => Promise<Row[]>
  /** the page query, LIMIT `DEFAULT_PAGE_SIZE` */
  list: (params: ListSqlParams) => Promise<Row[]>
  /** reshapes the parsed page (grouping/sorting) before returning */
  transform?: (items: z.infer<S>[]) => R
}

export async function runListFetch<
  S extends z.ZodType<{ id?: string }>,
  R = z.infer<S>[]
>({
  cursor,
  query,
  itemType,
  schema,
  cursorKey,
  cursorExtra,
  count,
  list,
  transform
}: RunListFetchOptions<S, R>): Promise<{
  res: R
  nextCursor: string | null
  totalCount: number
}> {
  const like = query ? `%${escapeLike(query)}%` : null

  let totalCount: number
  try {
    const counted = await count(like)
    totalCount = (counted[0]?.count as number) ?? 0
  } catch (cause) {
    throw new Error(
      `Failed to fetch ${itemTypeToLabel(itemType, true, true)} count.`,
      { cause }
    )
  }

  const decoded = decodeCursor(cursor)

  try {
    const data = await list({
      like,
      cursorName: decoded?.name ?? null,
      cursorId: decoded?.id ?? null,
      cursor: decoded
    })
    const formatted = formatResponseWithCursor(
      data,
      cursorKey,
      schema,
      cursorExtra
    )
    return {
      res: transform
        ? transform(formatted.res)
        : (formatted.res as R),
      nextCursor: formatted.nextCursor,
      totalCount
    }
  } catch (cause) {
    throw new Error(
      `Failed to fetch ${itemTypeToLabel(itemType, false, true)}.`,
      { cause }
    )
  }
}
