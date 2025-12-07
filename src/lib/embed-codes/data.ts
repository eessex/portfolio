import {
  type QueryResultRow,
  sql
} from '@vercel/postgres'

import {
  dashboardEmbedCodeSchema,
  embedCodeSchema
} from '@/lib/embed-codes/schemas'
import type {
  DashboardEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/types'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor,
  type ResponseWithCursor
} from '@/lib/util'

export const fetchEmbedCodesByIds = async (ids: QueryResultRow[string]) => {
  try {
    const { rows } = await sql<EmbedCode>`
      SELECT * FROM embed_codes
      WHERE id = ANY(${ids})
    `
    return rows.map(row => formatDbResponseForClient(row, embedCodeSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}

export async function fetchEmbedCodes (cursor?: string) {
  const totalCount = await getTotalCount('')
  const decodedCursor = cursor ? decodeCursor(cursor) : undefined

  try {
    let data
    if (decodedCursor) {
      data = await sql<DashboardEmbedCode>`
        SELECT
          embed_codes.*,
          ARRAY(
            SELECT slug FROM events AS e
            WHERE e.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS event_slugs,
          ARRAY(
            SELECT slug FROM projects AS p
            WHERE p.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS project_slugs,
          ARRAY(
            SELECT slug FROM releases AS r
            WHERE r.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS release_slugs
        FROM embed_codes
        WHERE (updated_at, id) < (
          (SELECT updated_at FROM embed_codes WHERE id = ${decodedCursor.id}),
          ${decodedCursor.id}
        )
        ORDER BY updated_at DESC, id DESC
        LIMIT ${DEFAULT_PAGE_SIZE};
      `
    } else {
      data = await sql<DashboardEmbedCode>`
        SELECT
          embed_codes.*,
          ARRAY(
            SELECT slug FROM events AS e
            WHERE e.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS event_slugs,
          ARRAY(
            SELECT slug FROM projects AS p
            WHERE p.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS project_slugs,
          ARRAY(
            SELECT slug FROM releases AS r
            WHERE r.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS release_slugs
        FROM embed_codes
        ORDER BY updated_at DESC, id DESC
        LIMIT ${DEFAULT_PAGE_SIZE};
      `
    }
    const formatted = formatResponseWithCursor(data, 'id', dashboardEmbedCodeSchema)
    const res: ResponseWithCursor<DashboardEmbedCode> = {
      ...formatted,
      totalCount
    }
    return res
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}

async function getTotalCount (query?: string) {
  try {
    if (!query) {
      const result = await sql`SELECT COUNT(*)::int AS count FROM embed_codes`
      return result.rows[0].count
    }

    const like = `%${query}%`
    const result = await sql<{ count: number }>`
      SELECT COUNT(*)::int AS count
      FROM embed_codes
      WHERE
        title ILIKE ${like} OR
        iframe ILIKE ${like} OR
        caption ILIKE ${like}
    `
    return result.rows[0]?.count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes count.')
  }
}
