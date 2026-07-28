'use server'

import { sql } from '@/lib/db'
import { fetchCachedLinksFirstPage } from '@/lib/links/cached'
import type { DashboardLink } from '@/lib/links/schemas/client'
import { dashboardLinkSchema } from '@/lib/links/schemas/client'
import { type CreateLink, linkSchema } from '@/lib/links/schemas/db'
import { runListFetch } from '@/lib/list-fetch'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  type ResponseWithCursor
} from '@/lib/util'

export async function fetchLinksByIds(ids: string[]) {
  try {
    const data = await sql`
      SELECT * FROM links
      WHERE id = ANY(${ids})
      ORDER BY
      COALESCE(publish_date, created_at) DESC
    `
    return data.map((row) =>
      formatDbResponseForClient(row, linkSchema)
    )
  } catch (cause) {
    throw new Error('Failed to fetch links.', { cause })
  }
}

export async function fetchLinkByUrl(link: CreateLink) {
  try {
    const data = await sql`
      SELECT
        links.*,
        ARRAY(
          SELECT slug FROM events AS e WHERE e.link_ids @> ARRAY[links.id]
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects AS p WHERE p.link_ids @> ARRAY[links.id]
        ) AS project_slugs,
        ARRAY(
          SELECT slug FROM releases AS r WHERE r.link_ids @> ARRAY[links.id]
        ) AS release_slugs
      FROM links
      WHERE url = ${link.url}
      LIMIT 1
    `
    if (data.length === 0) {
      return null
    } else {
      return {
        res: formatDbResponseForClient(data[0], linkSchema),
        fieldName: 'url' as keyof CreateLink
      }
    }
  } catch (cause) {
    throw new Error('Failed to fetch link.', { cause })
  }
}

export async function fetchLinks(cursor?: string, query?: string) {
  if (!cursor && !query) {
    return fetchCachedLinksFirstPage()
  }

  return fetchLinksRaw(cursor, query)
}

/** Only the press links */
export async function fetchPressLinksRaw() {
  try {
    const data = await sql`
      SELECT * FROM links
      WHERE type = 'press'
      ORDER BY publish_date DESC, created_at DESC
    `
    return data.map((row) =>
      formatDbResponseForClient(row, linkSchema)
    )
  } catch (cause) {
    throw new Error('Failed to fetch press links.', { cause })
  }
}

/** links to social media profiles */
export async function fetchSocialLinksRaw() {
  try {
    const data = await sql`
      SELECT * FROM links
      WHERE type = 'social'
      AND title IS NOT NULL
      ORDER BY title ASC
    `
    return data.map((row) =>
      formatDbResponseForClient(row, linkSchema)
    )
  } catch (cause) {
    throw new Error('Failed to fetch social links.', { cause })
  }
}

/**
 * dashboard: fetch all the links
 */
export async function fetchLinksRaw(
  cursor?: string,
  query?: string
): Promise<ResponseWithCursor<DashboardLink>> {
  return runListFetch({
    cursor,
    query,
    itemType: 'links',
    schema: dashboardLinkSchema,
    cursorKey: 'id',
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM links
      WHERE (
        ${like}::text IS NULL
        OR url ILIKE ${like}
        OR title ILIKE ${like}
        OR quotation ILIKE ${like}
      )
    `,
    list: ({ like, cursorName, cursorId }) => sql`
      SELECT
        links.*,
        ARRAY(
          SELECT slug FROM events AS e WHERE e.link_ids @> ARRAY[links.id]
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects AS p WHERE p.link_ids @> ARRAY[links.id]
        ) AS project_slugs,
        ARRAY(
          SELECT slug FROM releases AS r WHERE r.link_ids @> ARRAY[links.id]
        ) AS release_slugs
      FROM links
      WHERE (
        ${like}::text IS NULL
        OR url ILIKE ${like}
        OR title ILIKE ${like}
        OR quotation ILIKE ${like}
      )
      AND (
        ${cursorName}::text IS NULL
        OR (links.updated_at, links.id) < (
          SELECT updated_at, id FROM links WHERE id = ${cursorId}
        )
      )
      ORDER BY
        updated_at DESC,
        id DESC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
  })
}
