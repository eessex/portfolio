import { formatItemArrayRows } from '@/lib/data'
import type { Link } from '@/lib/definitions'
import { type QueryResultRow, sql } from '@vercel/postgres'

export const fetchLinksByIds = async (ids: QueryResultRow[string]): Promise<Link[]> => {
  try {
    const { rows } = await sql`
      SELECT * FROM links
      WHERE id = ANY(${ids})
      ORDER BY 
      (is_press AND quotation IS NOT NULL) DESC,
      COALESCE(published_date, created_at) DESC
    `
    return formatItemArrayRows<Link>(rows, ids, false)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

export async function fetchLinks () {
  try {
    const { rows } = await sql`
          SELECT 
          links.*,
          ARRAY(
            SELECT slug FROM releases as r WHERE r.link_ids @> ARRAY[links.id]
          ) AS release_slugs,
          ARRAY(
            SELECT slug FROM events as e WHERE e.link_ids @> ARRAY[links.id]
          ) AS event_slugs
          FROM links
          ORDER BY links.updated_at DESC
        `
    return formatItemArrayRows<Link>(rows, rows.map(row => row.id))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}
