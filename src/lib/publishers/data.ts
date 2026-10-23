'use server'

import { sql } from '@/lib/db'
import { runListFetch } from '@/lib/list-fetch'
import { fetchCachedPublishersFirstPage } from '@/lib/publishers/cached'
import {
  type DashboardPublisher,
  dashboardPublisherSchema
} from '@/lib/publishers/schemas/client'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  type ResponseWithCursor
} from '@/lib/util'

export async function fetchPublisherById(id: string) {
  try {
    const data = await sql`
      SELECT
        publishers.*,
        ARRAY(
          SELECT r.slug FROM published_editions pe
          JOIN releases r ON r.id = pe.release_id
          WHERE pe.publisher_id = publishers.id
        ) AS release_slugs
      FROM publishers
      WHERE publishers.id = ${id}
      LIMIT 1
    `
    if (data.length === 0) {
      return null
    } else {
      return formatDbResponseForClient(
        data[0],
        dashboardPublisherSchema
      )
    }
  } catch (cause) {
    throw new Error('Failed to fetch publisher.', { cause })
  }
}

/**
 * dashboard: fetch all the publishers
 */
export async function fetchPublishers(
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedPublishersFirstPage()
  }

  return fetchPublishersRaw(cursor, query)
}

/**
 * dashboard: fetch all the publishers
 */
export async function fetchPublishersRaw(
  cursor?: string,
  query?: string
): Promise<ResponseWithCursor<DashboardPublisher>> {
  return runListFetch({
    cursor,
    query,
    itemType: 'publishers',
    schema: dashboardPublisherSchema,
    cursorKey: 'name',
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM publishers
      WHERE (
        ${like}::text IS NULL
        OR publishers.name ILIKE ${like}
        OR publishers.type ILIKE ${like}
        OR publishers.url ILIKE ${like}
      )
    `,
    list: ({ like, cursorName, cursorId }) => sql`
      SELECT
        publishers.*,
        ARRAY(
          SELECT r.slug FROM published_editions pe
          JOIN releases r ON r.id = pe.release_id
          WHERE pe.publisher_id = publishers.id
        ) AS release_slugs
      FROM publishers
      WHERE (
        ${like}::text IS NULL
        OR publishers.name ILIKE ${like}
        OR publishers.type ILIKE ${like}
        OR publishers.url ILIKE ${like}
      )
      -- the built-in publisher leads the first page, so later pages
      -- (after a cursor) skip it and continue by name
      AND (
        ${cursorName}::text IS NULL
        OR (
          NOT publishers.is_built_in
          AND (
            LOWER(publishers.name) > LOWER(${cursorName})
            OR (LOWER(publishers.name) = LOWER(${cursorName}) AND publishers.id > ${cursorId})
          )
        )
      )
      ORDER BY
        publishers.is_built_in DESC,
        LOWER(publishers.name) ASC,
        publishers.id ASC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
  })
}
