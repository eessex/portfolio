'use server'

import { sql } from '@/lib/db'
import { fetchCachedImagesFirstPage } from '@/lib/images/cached'
import {
  type DashboardImage,
  dashboardImageSchema
} from '@/lib/images/schemas/client'
import {
  type CreateImage,
  imageSchema
} from '@/lib/images/schemas/db'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor,
  type ResponseWithCursor
} from '@/lib/util'

export async function fetchImageByUrl(image: CreateImage) {
  try {
    const data = await sql`
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
    if (data.length === 0) {
      return null
    } else {
      return {
        res: formatDbResponseForClient(data[0], imageSchema),
        fieldName: 'url' as keyof CreateImage
      }
    }
  } catch (cause) {
    throw new Error('Failed to fetch image by URL.', { cause })
  }
}

export async function fetchImageById(id: string) {
  try {
    const data = await sql`
      SELECT * FROM images
      WHERE id = ${id}
    `
    if (data.length === 0) {
      console.debug(`Image with id ${id} not found.`)
      return
    }
    return formatDbResponseForClient(data[0], imageSchema)
  } catch (cause) {
    throw new Error(`Failed to fetch image ${id}.`, { cause })
  }
}

export const fetchImagesByIds = async (ids: string[]) => {
  try {
    const data = await sql`
      SELECT * FROM images
      WHERE id = ANY(${ids})
    `
    return data.map((row) =>
      formatDbResponseForClient(row, imageSchema)
    )
  } catch (cause) {
    throw new Error('Failed to fetch images.', { cause })
  }
}

export async function fetchImages(cursor?: string, query?: string) {
  if (!cursor && !query) {
    return fetchCachedImagesFirstPage()
  }

  return fetchImagesRaw(cursor, query)
}

/**
 * dashboard: fetch all the images
 */
export async function fetchImagesRaw(
  cursor?: string,
  query?: string
) {
  const totalCount = await getTotalCount(query)
  const decodedCursor = cursor ? decodeCursor(cursor) : undefined

  const like = query ? `%${query}%` : null
  const cursorName = decodedCursor?.name ?? null
  const cursorId = decodedCursor?.id ?? null

  try {
    const data = await sql`
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
    const formatted = formatResponseWithCursor(
      data,
      'id',
      dashboardImageSchema
    )
    const res: ResponseWithCursor<DashboardImage> = {
      ...formatted,
      totalCount
    }
    return res
  } catch (cause) {
    throw new Error('Failed to fetch images.', { cause })
  }
}

async function getTotalCount(query?: string) {
  try {
    const like = query ? `%${query}%` : null
    const result = await sql`
      SELECT COUNT(*)::int AS count
      FROM images
      WHERE (
        ${like}::text IS NULL
        OR url ILIKE ${like}
        OR title ILIKE ${like}
        OR caption ILIKE ${like}
      )
    `
    return result[0]?.count ?? 0
  } catch (cause) {
    throw new Error('Failed to fetch image count.', { cause })
  }
}
