import type { QueryResultRow } from '@vercel/postgres'
import { sql } from '@vercel/postgres'

import {
  dashboardImageSchema,
  imageSchema
} from '@/lib/images/schemas'
import type {
  DashboardImage,
  Image
} from '@/lib/images/types'
import { formatDbResponseForClient } from '@/ui/util'

async function _fetchImage (id: string) {
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

const _fetchImagesByIds = async (ids: QueryResultRow[string]) => {
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
        SELECT slug FROM releases AS r 
        WHERE (r.image_ids @> ARRAY[images.id] OR r.cover_image_id = images.id)
      ) AS release_slugs,
      ARRAY(
        SELECT slug FROM events AS e 
        WHERE (e.image_ids @> ARRAY[images.id] OR e.cover_image_id = images.id)
      ) AS event_slugs,
      ARRAY(
        SELECT slug FROM projects as p WHERE p.image_ids @> ARRAY[images.id]
      ) AS project_slugs
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
