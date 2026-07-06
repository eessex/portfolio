'use server'

import { sql } from '@/lib/db'
import { fetchCachedPublishedEditionsFirstPage } from '@/lib/published-editions/cached'
import {
  type DashboardPublishedEdition,
  dashboardPublishedEditionSchema
} from '@/lib/published-editions/schemas/client'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor,
  type ResponseWithCursor
} from '@/lib/util'

export async function fetchPublishedEditionById(id: string) {
  try {
    const data = await sql`
      SELECT
        published_editions.*,
        (
          SELECT build_image_json(i) FROM images i
          WHERE i.id = published_editions.cover_image_id
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
          FROM images i
          WHERE i.id = ANY(published_editions.image_ids)
        ) AS images,
        (
          SELECT build_link_json(l) FROM links l
          WHERE l.id = published_editions.buy_link_id
        ) AS buy_link,
        jsonb_build_object(
          'id', r.id,
          'title', r.title,
          'coverImageId', r.cover_image_id
        ) AS release,
        ARRAY[r.slug] AS release_slugs
      FROM published_editions
      JOIN releases r ON r.id = published_editions.release_id
      WHERE published_editions.id = ${id}
      LIMIT 1
    `
    if (data.length === 0) {
      return null
    } else {
      return formatDbResponseForClient(
        data[0],
        dashboardPublishedEditionSchema
      )
    }
  } catch (cause) {
    throw new Error('Failed to fetch published edition.', { cause })
  }
}

export async function fetchPublishedEditions(
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedPublishedEditionsFirstPage()
  }

  return fetchPublishedEditionsRaw(cursor, query)
}

/**
 * dashboard: fetch all the published editions
 */
export async function fetchPublishedEditionsRaw(
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
        published_editions.*,
        (
          SELECT build_image_json(i) FROM images i
          WHERE i.id = published_editions.cover_image_id
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
          FROM images i
          WHERE i.id = ANY(published_editions.image_ids)
        ) AS images,
        (
          SELECT build_link_json(l) FROM links l
          WHERE l.id = published_editions.buy_link_id
        ) AS buy_link,
        jsonb_build_object(
          'id', r.id,
          'title', r.title,
          'coverImageId', r.cover_image_id
        ) AS release,
        ARRAY[r.slug] AS release_slugs
      FROM published_editions
      JOIN releases r ON r.id = published_editions.release_id
      WHERE (
        ${like}::text IS NULL
        OR published_editions.publisher ILIKE ${like}
        OR r.title ILIKE ${like}
      )
      AND (
        ${cursorName}::text IS NULL
        OR LOWER(published_editions.publisher) > LOWER(${cursorName})
        OR (LOWER(published_editions.publisher) = LOWER(${cursorName}) AND published_editions.id > ${cursorId})
      )
      ORDER BY
        LOWER(published_editions.publisher) ASC,
        published_editions.id ASC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `

    const formatted = formatResponseWithCursor(
      data,
      'publisher',
      dashboardPublishedEditionSchema
    )

    const res: ResponseWithCursor<DashboardPublishedEdition> = {
      ...formatted,
      totalCount
    }
    return res
  } catch (cause) {
    throw new Error('Failed to fetch published editions.', {
      cause
    })
  }
}

async function getTotalCount(query?: string) {
  try {
    const like = query ? `%${query}%` : null
    const result = await sql`
      SELECT COUNT(*)::int AS count
      FROM published_editions
      JOIN releases r ON r.id = published_editions.release_id
      WHERE (
        ${like}::text IS NULL
        OR published_editions.publisher ILIKE ${like}
        OR r.title ILIKE ${like}
      )
    `
    return result[0]?.count ?? 0
  } catch (cause) {
    throw new Error('Failed to fetch published edition count.', {
      cause
    })
  }
}
