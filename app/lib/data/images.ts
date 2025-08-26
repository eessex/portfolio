import { QueryResultRow, sql } from '@vercel/postgres'
import { type Image } from '@/lib/definitions'
import { formatItemArrayRows } from '@/lib/data'

export const fetchImagesByIds = async (ids: QueryResultRow[string]): Promise<Image[]> => {
  try {
    const { rows } = await sql`
      SELECT * FROM images
      WHERE id = ANY(${ids})
    `
    return formatItemArrayRows<Image>(rows, ids, false)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch images.')
  }
}

export async function fetchImages () {
  try {
    const { rows } = await sql`
          SELECT 
          images.*,
          ARRAY(
            SELECT slug FROM releases as r WHERE r.link_ids @> ARRAY[images.id]
          ) AS release_slugs,
          ARRAY(
            SELECT slug FROM events as e WHERE e.link_ids @> ARRAY[images.id]
          ) AS event_slugs
          FROM images
          ORDER BY images.updated_at DESC
        `
    return formatItemArrayRows<Image>(rows, rows.map(row => row.id))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch images.')
  }
}
