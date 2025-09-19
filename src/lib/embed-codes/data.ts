import { dashboardEmbedCodeSchema, embedCodeSchema } from '@/lib/embed-codes/schemas'
import type { DashboardEmbedCode, EmbedCode } from '@/lib/embed-codes/types'
import { formatDbResponseForClient } from '@/ui/util'
import { type QueryResultRow, sql } from '@vercel/postgres'

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

export async function fetchEmbedCodes () {
  try {
    const data = await sql<DashboardEmbedCode>`
      SELECT
      embed_codes.*,
      ARRAY(
        SELECT slug FROM releases as r WHERE r.embed_code_ids @> ARRAY[embed_codes.id]
      ) AS release_slugs,
      ARRAY(
        SELECT slug FROM events as e WHERE e.embed_code_ids @> ARRAY[embed_codes.id]
      ) AS event_slugs
      FROM embed_codes
      ORDER BY embed_codes.updated_at DESC
    `
    return data.rows.map(row => formatDbResponseForClient(row, dashboardEmbedCodeSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}
