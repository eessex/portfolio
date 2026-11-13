import { sql } from '@/lib/db'
import {
  type DashboardImage,
  dashboardImageSchema
} from '@/lib/images/schemas/client'
import {
  type CreateImage,
  imageSchema
} from '@/lib/images/schemas/db'
import { runListFetch } from '@/lib/list-fetch'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
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
          SELECT slug FROM projects AS p WHERE (p.image_ids @> ARRAY[images.id] OR p.cover_image_id = images.id)
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

export interface FetchImagesOptions {
  /** Leave out SVGs, which only the site icon and logo pickers take */
  isSvgExcluded?: boolean
}

/**
 * dashboard: fetch all the images, or only images of a given `type`
 * (e.g. the about page press-photo cover-image picker).
 */
export async function fetchImagesRaw(
  cursor?: string,
  query?: string,
  type?: string,
  { isSvgExcluded = false }: FetchImagesOptions = {}
): Promise<ResponseWithCursor<DashboardImage>> {
  const typeFilter = type ?? null

  return runListFetch({
    cursor,
    query,
    itemType: 'images',
    schema: dashboardImageSchema,
    cursorKey: 'id',
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM images
      WHERE (
        ${like}::text IS NULL
        OR url ILIKE ${like}
        OR title ILIKE ${like}
        OR caption ILIKE ${like}
        OR alt ILIKE ${like}
        OR type ILIKE ${like}
      )
      AND (${typeFilter}::text IS NULL OR type = ${typeFilter})
      AND (NOT ${isSvgExcluded} OR format IS DISTINCT FROM 'svg')
    `,
    list: ({ like, cursorName, cursorId }) => sql`
      SELECT
        images.*,
        ARRAY(
          SELECT slug FROM events AS e
          WHERE (e.image_ids @> ARRAY[images.id] OR e.cover_image_id = images.id)
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects AS p WHERE (p.image_ids @> ARRAY[images.id] OR p.cover_image_id = images.id)
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
        OR alt ILIKE ${like}
        OR images.type ILIKE ${like}
      )
      AND (${typeFilter}::text IS NULL OR images.type = ${typeFilter})
      AND (
        NOT ${isSvgExcluded}
        OR images.format IS DISTINCT FROM 'svg'
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
  })
}
