import { formatItemArrayRows } from '@/lib/data'
import type { EmbedCode } from '@/lib/definitions'
import { type QueryResultRow, sql } from '@vercel/postgres'

export const fetchEmbedCodesByIds = async (ids: QueryResultRow[string]): Promise<EmbedCode[]> => {
  try {
    const { rows } = await sql`
      SELECT * FROM embed_codes
      WHERE id = ANY(${ids})
    `
    return formatItemArrayRows<EmbedCode>(rows, ids)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}

export async function fetchEmbedCodes () {
  try {
    const { rows } = await sql`
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
    return formatItemArrayRows<EmbedCode>(rows)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}
