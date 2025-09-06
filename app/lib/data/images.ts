import type { DashboardImage, Image } from '@/lib/definitions'
import { dashboardImageSchema, imageSchema } from '@/lib/scemas'
import { formatDbResponseForClient } from '@/ui/util'
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
    return formatDbResponseForClient(data.rows[0], imageSchema)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch image ${id}.`)
  }
}

export const fetchImagesByIds = async (ids: QueryResultRow[string]) => {
  try {
    const data = await sql<Image>`
      SELECT * FROM images
      WHERE id = ANY(${ids})
    `
    return data.rows.map(row => formatDbResponseForClient(row, imageSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch images.')
  }
}

/** dashboard: fetch all the images */
export async function fetchImages () {
  try {
    const data = await sql<DashboardImage>`
      SELECT 
      images.*,
      ARRAY(
        SELECT slug FROM releases as r WHERE r.image_ids @> ARRAY[images.id]
      ) AS release_slugs,
      ARRAY(
        SELECT slug FROM events as e WHERE e.image_ids @> ARRAY[images.id]
      ) AS event_slugs
      FROM images
      ORDER BY images.updated_at DESC
    `
    return data.rows.map(row => formatDbResponseForClient(row, dashboardImageSchema))
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
    return data.rows.map(row => formatDbResponseForClient(row, imageSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch press images.')
  }
}
