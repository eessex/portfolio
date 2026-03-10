'use server'

import type { QueryResultRow } from '@vercel/postgres'
import { sql } from '@vercel/postgres'

import {
  dashboardImageSchema,
  imageSchema
} from '@/lib/images/schemas'
import type {
  CreateImage,
  DashboardImage,
  Image
} from '@/lib/images/types'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor,
  type ResponseWithCursor
} from '@/lib/util'

export async function fetchImageByUrl (image: CreateImage) {
  try {
    const { rows } = await sql<Image>`
      SELECT
        images.*,
        ARRAY(
          SELECT slug FROM events AS e 
          WHERE (e.image_ids @> ARRAY[images.id] OR e.cover_image_id = images.id)
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects AS p WHERE p.image_ids @> ARRAY[images.id]
        ) AS project_slugs,
        ARRAY(
          SELECT slug FROM releases AS r 
          WHERE (r.image_ids @> ARRAY[images.id] OR r.cover_image_id = images.id)
        ) AS release_slugs
      FROM images
      WHERE url = ${image.url}
      LIMIT 1
    `
    if (rows.length === 0) {
      return null
    } else {
      return {
        res: formatDbResponseForClient(rows[0], imageSchema),
        fieldName: 'url' as keyof CreateImage
      }
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed code by iframe.')
  }
}

export async function fetchImageById (id: string) {
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

/**
 * dashboard: fetch all the images
 */
export async function fetchImages (cursor?: string, query?: string) {
  const totalCount = await getTotalCount(query)
  const decodedCursor = cursor ? decodeCursor(cursor) : undefined

  const like = query ? `%${query}%` : null
  const cursorName = decodedCursor?.name ?? null
  const cursorId = decodedCursor?.id ?? null

  try {
    const data = await sql<DashboardImage>`
      SELECT 
        images.*,
        ARRAY(
          SELECT slug FROM events AS e 
          WHERE (e.image_ids @> ARRAY[images.id] OR e.cover_image_id = images.id)
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects AS p WHERE p.image_ids @> ARRAY[images.id]
        ) AS project_slugs,
        ARRAY(
          SELECT slug FROM releases AS r 
          WHERE (r.image_ids @> ARRAY[images.id] OR r.cover_image_id = images.id)
        ) AS release_slugs
      FROM images
      WHERE (
        ${like}::text IS NULL
        OR url ILIKE ${like}
        OR title ILIKE ${like}
        OR caption ILIKE ${like}
      )
      AND (
        ${cursorName}::text IS NULL
        OR (images.updated_at, images.id) < (
          SELECT updated_at, id FROM images WHERE id = ${cursorId}
        )
      )
      ORDER BY
        updated_at DESC,
        id DESC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
    const formatted = formatResponseWithCursor(data, 'id', dashboardImageSchema)
    const res: ResponseWithCursor<DashboardImage> = {
      ...formatted,
      totalCount
    }
    return res
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

async function getTotalCount (query?: string) {
  try {
    const like = query ? `%${query}%` : null
    const result = await sql<{ count: number }>`
      SELECT COUNT(*)::int AS count
      FROM images
      WHERE (
        ${like}::text IS NULL
        OR url ILIKE ${like}
        OR title ILIKE ${like}
        OR caption ILIKE ${like}
      )
    `
    return result.rows[0].count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch image count.')
  }
}
