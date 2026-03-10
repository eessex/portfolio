'use server'

import {
  type QueryResultRow,
  sql
} from '@vercel/postgres'

import {
  dashboardEmbedCodeSchema,
  embedCodeSchema
} from '@/lib/embed-codes/schemas'
import type {
  CreateEmbedCode,
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
      WHERE id = ANY(${ids})
    `
    return rows.map(row => formatDbResponseForClient(row, embedCodeSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}

export async function fetchEmbedCodeByIframe (embedCode: CreateEmbedCode) {
  try {
    const { rows } = await sql<EmbedCode>`
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
      WHERE iframe = ${embedCode.iframe}
      LIMIT 1
    `
    if (rows.length === 0) {
      return null
    } else {
      return {
        res: formatDbResponseForClient(rows[0], embedCodeSchema),
        fieldName: 'iframe' as keyof CreateEmbedCode
      }
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed code by iframe.')
  }
}

/**
 * dashboard: fetch all the embed codes
 */
export async function fetchEmbedCodes (cursor?: string, query?: string) {
  const totalCount = await getTotalCount(query)
  const decodedCursor = cursor ? decodeCursor(cursor) : undefined

  const like = query ? `%${query}%` : null
  const cursorName = decodedCursor?.name ?? null
  const cursorId = decodedCursor?.id ?? null

  try {
    const data = await sql<DashboardEmbedCode>`
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
      WHERE (
        ${like}::text IS NULL
        OR title ILIKE ${like}
        OR iframe ILIKE ${like}
        OR caption ILIKE ${like}
      )
      AND (
        ${cursorName}::text IS NULL
        OR (embed_codes.updated_at, embed_codes.id) < (
          SELECT updated_at, id FROM embed_codes WHERE id = ${cursorId}
        )
      )
      ORDER BY
        updated_at DESC,
        id DESC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
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
    const like = query ? `%${query}%` : null
    const result = await sql<{ count: number }>`
      SELECT COUNT(*)::int AS count
      FROM embed_codes
      WHERE (
        ${like}::text IS NULL
        OR title ILIKE ${like}
        OR iframe ILIKE ${like}
        OR caption ILIKE ${like}
      )
    `
    return result.rows[0]?.count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes count.')
  }
}
