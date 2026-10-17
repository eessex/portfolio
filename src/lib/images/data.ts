'use server'

import { sql } from '@/lib/db'
import {
  fetchCachedImagesFirstPage,
  fetchCachedPressImagesFirstPage
} from '@/lib/images/cached'
import {
  type DashboardImage,
  dashboardImageSchema
} from '@/lib/images/schemas/client'
import {
  type CreateImage,
  type Image,
  imageSchema
} from '@/lib/images/schemas/db'
import { runListFetch } from '@/lib/list-fetch'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  type ResponseWithCursor
} from '@/lib/util'

const s3Prefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/images/`

function makeS3SafeKey(filename: string) {
  return (
    encodeURIComponent(filename)
      // S3 allows slashes for "folders", so restore them if needed
      .replace(/%2F/g, '/')
  )
}

export async function checkIfImageExists(
  filename: string,
  id?: string
): Promise<Image | false> {
  try {
    const formattedFilename = s3Prefix + makeS3SafeKey(filename)
    const rows = await sql`
      SELECT * FROM images WHERE url = ${formattedFilename}
    `
    const existingImage = rows[0]

    if (existingImage && (existingImage as Image).id !== id) {
      return existingImage as Image
    } else {
      return false
    }
  } catch (cause) {
    throw new Error('Failed to check if image exists.', { cause })
  }
}

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
          SELECT slug FROM projects AS p WHERE p.id = images.project_id
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

export async function fetchImages(
  cursor?: string,
  query?: string,
  type?: string
) {
  if (!cursor && !query) {
    if (type === 'press') return fetchCachedPressImagesFirstPage()
    if (!type) return fetchCachedImagesFirstPage()
  }

  return fetchImagesRaw(cursor, query, type)
}

/**
 * dashboard: fetch all the images, or only images of a given `type`
 * (e.g. the about page press-photo cover-image picker).
 */
export async function fetchImagesRaw(
  cursor?: string,
  query?: string,
  type?: string
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
      )
      AND (${typeFilter}::text IS NULL OR type = ${typeFilter})
    `,
    list: ({ like, cursorName, cursorId }) => sql`
      SELECT
        images.*,
        ARRAY(
          SELECT slug FROM events AS e
          WHERE (e.image_ids @> ARRAY[images.id] OR e.cover_image_id = images.id)
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects AS p WHERE p.id = images.project_id
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
      AND (${typeFilter}::text IS NULL OR images.type = ${typeFilter})
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
