import { sql } from '@/lib/db'
import type { DashboardLink } from '@/lib/links/schemas/client'
import { dashboardLinkSchema } from '@/lib/links/schemas/client'
import {
  type Link,
  linkSchema,
  type LinkType
} from '@/lib/links/schemas/db'
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

/**
 * The `type` link already saved with `url`, if any; the most recently
 * updated wins, since `url` isn't unique. A link of another type with
 * the same url doesn't match, so the caller creates a separate link.
 * `title`, if given, must match too (case-insensitively).
 */
export async function fetchLinkByUrl(
  url: string,
  type: LinkType,
  title?: string
): Promise<Link | undefined> {
  try {
    const [row] = await sql`
      SELECT * FROM links
      WHERE url = ${url.trim()}
      AND type = ${type}
      AND (${title ?? null}::text IS NULL OR lower(title) = lower(${title ?? null}))
      ORDER BY updated_at DESC
      LIMIT 1
    `
    return row
      ? formatDbResponseForClient(row, linkSchema)
      : undefined
  } catch (cause) {
    throw new Error('Failed to fetch link.', { cause })
  }
}

/**
 * dashboard: fetch all the links
 */
export async function fetchLinksRaw(
  cursor?: string,
  query?: string,
  isPress?: boolean
): Promise<ResponseWithCursor<DashboardLink>> {
  const pressFilter = isPress ?? null
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
        OR attribution ILIKE ${like}
        OR type ILIKE ${like}
      )
      AND (
        ${pressFilter}::boolean IS NULL
        OR (type IS NOT DISTINCT FROM 'press') = ${pressFilter}
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
        OR attribution ILIKE ${like}
        OR type ILIKE ${like}
      )
      AND (
        ${pressFilter}::boolean IS NULL
        OR (type IS NOT DISTINCT FROM 'press') = ${pressFilter}
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
