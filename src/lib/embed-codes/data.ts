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
  console.info('fetchEmbedCodes cursor', cursor)
  console.info('Decoded Cursor:', decodedCursor, cursor)
  try {
    let data
    if (decodedCursor) {
      data = await sql<DashboardEmbedCode>`
        SELECT
          embed_codes.*,
          ARRAY(
            SELECT slug FROM events as e
            WHERE e.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS event_slugs,
          ARRAY(
            SELECT slug FROM projects as p
            WHERE p.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS project_slugs,
          ARRAY(
            SELECT slug FROM releases as r
            WHERE r.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS release_slugs
        FROM embed_codes
        WHERE
          LOWER(embed_codes.iframe) > LOWER(${decodedCursor.name})
          OR (LOWER(embed_codes.iframe) = LOWER(${decodedCursor.name}) AND embed_codes.id > ${decodedCursor.id})
        ORDER BY embed_codes.updated_at DESC
        LIMIT ${DEFAULT_PAGE_SIZE};
      `
    } else {
      data = await sql<DashboardEmbedCode>`
        SELECT
          embed_codes.*,
          ARRAY(
            SELECT slug FROM events as e
            WHERE e.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS event_slugs,
          ARRAY(
            SELECT slug FROM projects as p
            WHERE p.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS project_slugs,
          ARRAY(
            SELECT slug FROM releases as r
            WHERE r.embed_code_ids @> ARRAY[embed_codes.id]
          ) AS release_slugs
        FROM embed_codes
        ORDER BY embed_codes.updated_at DESC
        LIMIT ${DEFAULT_PAGE_SIZE};
      `
    }
    const formatted = formatResponseWithCursor(data, 'iframe', dashboardEmbedCodeSchema)
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
