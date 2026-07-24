'use server'

import { sql } from '@/lib/db'
import { runListFetch } from '@/lib/list-fetch'
import { fetchCachedPublishedEditionsFirstPage } from '@/lib/published-editions/cached'
import {
  type DashboardPublishedEdition,
  dashboardPublishedEditionSchema
} from '@/lib/published-editions/schemas/client'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  type ResponseWithCursor
} from '@/lib/util'

export async function fetchPublishedEditionById(id: string) {
  try {
    const data = await sql`
      SELECT
        -- published_editions.* includes the deprecated raw publisher
        -- string column; the computed "publisher" object below must be
        -- listed after it so it wins the column-name collision.
        published_editions.*,
        (
          CASE
            WHEN published_editions.cover_image_id IS NOT NULL
            THEN (
              SELECT build_image_json(i) FROM images i
              WHERE i.id = published_editions.cover_image_id
            )
          END
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
          FROM images i
          WHERE i.id = ANY(published_editions.image_ids)
        ) AS images,
        (
          CASE
            WHEN published_editions.buy_link_id IS NOT NULL
            THEN (
              SELECT build_link_json(l) FROM links l
              WHERE l.id = published_editions.buy_link_id
            )
          END
        ) AS buy_link,
        jsonb_build_object(
          'id', r.id,
          'title', r.title,
          'coverImageId', r.cover_image_id
        ) AS release,
        ARRAY[r.slug] AS release_slugs,
        p.name AS publisher_name,
        (
          CASE
            WHEN published_editions.publisher_id IS NOT NULL
            THEN build_publisher_json(p)
          END
        ) AS publisher
      FROM published_editions
      JOIN releases r ON r.id = published_editions.release_id
      LEFT JOIN publishers p ON p.id = published_editions.publisher_id
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
): Promise<ResponseWithCursor<DashboardPublishedEdition>> {
  return runListFetch({
    cursor,
    query,
    itemType: 'publishedEditions',
    schema: dashboardPublishedEditionSchema,
    cursorKey: 'publisherName',
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM published_editions
      JOIN releases r ON r.id = published_editions.release_id
      LEFT JOIN publishers p ON p.id = published_editions.publisher_id
      WHERE (
        ${like}::text IS NULL
        OR published_editions.publisher ILIKE ${like}
        OR p.name ILIKE ${like}
        OR r.title ILIKE ${like}
      )
    `,
    list: ({ like, cursorName, cursorId }) => sql`
      SELECT
        -- published_editions.* includes the deprecated raw publisher
        -- string column; the computed "publisher" object below must be
        -- listed after it so it wins the column-name collision.
        published_editions.*,
        (
          CASE
            WHEN published_editions.cover_image_id IS NOT NULL
            THEN (
              SELECT build_image_json(i) FROM images i
              WHERE i.id = published_editions.cover_image_id
            )
          END
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
          FROM images i
          WHERE i.id = ANY(published_editions.image_ids)
        ) AS images,
        (
          CASE
            WHEN published_editions.buy_link_id IS NOT NULL
            THEN (
              SELECT build_link_json(l) FROM links l
              WHERE l.id = published_editions.buy_link_id
            )
          END
        ) AS buy_link,
        jsonb_build_object(
          'id', r.id,
          'title', r.title,
          'coverImageId', r.cover_image_id
        ) AS release,
        ARRAY[r.slug] AS release_slugs,
        p.name AS publisher_name,
        (
          CASE
            WHEN published_editions.publisher_id IS NOT NULL
            THEN build_publisher_json(p)
          END
        ) AS publisher
      FROM published_editions
      JOIN releases r ON r.id = published_editions.release_id
      LEFT JOIN publishers p ON p.id = published_editions.publisher_id
      WHERE (
        ${like}::text IS NULL
        OR published_editions.publisher ILIKE ${like}
        OR p.name ILIKE ${like}
        OR r.title ILIKE ${like}
      )
      AND (
        ${cursorName}::text IS NULL
        OR LOWER(p.name) > LOWER(${cursorName})
        OR (LOWER(p.name) = LOWER(${cursorName}) AND published_editions.id > ${cursorId})
      )
      ORDER BY
        LOWER(p.name) ASC,
        published_editions.id ASC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
  })
}
