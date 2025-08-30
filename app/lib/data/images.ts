import { formatItemArrayRows } from '@/lib/data'
import { type Image } from '@/lib/definitions'
import { QueryResultRow, sql } from '@vercel/postgres'

export async function fetchImage (id: string) {
  try {
    const data = await sql<Image>`
      SELECT * FROM images
      WHERE id = ${id}
    `
    if (data.rowCount === 0) {
      console.debug(`Image with id ${id} not found.`)
      return
    }
    return data.rows[0]
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch image ${id}.`)
  }
}

export const fetchImagesByIds = async (ids: QueryResultRow[string]): Promise<Image[]> => {
  try {
    const { rows } = await sql`
      SELECT * FROM images
      WHERE id = ANY(${ids})
    `
    return formatItemArrayRows<Image>(rows, ids)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch images.')
  }
}

/** dashboard: fetch all the images */
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

/** Only the press photos */
export async function fetchPressImages () {
  try {
    const data = await sql<Image>`
      SELECT * FROM images
      WHERE is_press = true
    `
    return data.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch press images.')
  }
}
