import { sql } from '@/lib/db'
import { runListFetch } from '@/lib/list-fetch'
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
    // a label site's own publisher (the default project's) leads,
    // then the built-in one; on artist sites it's NULL, so only the
    // built-in one does
    list: ({ like, cursorName, cursorId }) => sql`
      WITH house AS (
        SELECT p.publisher_id AS id FROM projects p
        WHERE p.is_default_project
      )
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
      -- the leading publishers head the first page, so later pages
      -- (after a cursor) skip them and continue by name
      AND (
        ${cursorName}::text IS NULL
        OR (
          NOT publishers.is_built_in
          AND publishers.id IS DISTINCT FROM (SELECT id FROM house)
          AND (
            LOWER(publishers.name) > LOWER(${cursorName})
            OR (LOWER(publishers.name) = LOWER(${cursorName}) AND publishers.id > ${cursorId})
          )
        )
      )
      ORDER BY
        publishers.id IS NOT DISTINCT FROM (SELECT id FROM house) DESC,
        publishers.is_built_in DESC,
        LOWER(publishers.name) ASC,
        publishers.id ASC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
  })
}
