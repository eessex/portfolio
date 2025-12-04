import {
  type QueryResultRow,
  sql
} from '@vercel/postgres'

import {
  dashboardLinkSchema,
  linkSchema
} from '@/lib/links/schemas'
import type {
  DashboardLink,
  Link
} from '@/lib/links/types'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor,
  type ResponseWithCursor
} from '@/lib/util'

export const fetchLinksByIds = async (ids: QueryResultRow[string]) => {
  try {
    const data = await sql<Link>`
      SELECT * FROM links
      WHERE id = ANY(${ids})
      ORDER BY
      COALESCE(publish_date, created_at) DESC;
    `
    return data.rows.map(row => formatDbResponseForClient(row, linkSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

/** dashboard: all the links */
export async function fetchLinks () {
  const totalCount = await getTotalCount('')

  try {
    const data = await sql<DashboardLink>`
      SELECT
        links.*,
        ARRAY(
          SELECT slug FROM events as e WHERE e.link_ids @> ARRAY[links.id]
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects as p WHERE p.link_ids @> ARRAY[links.id]
        ) AS project_slugs,
        ARRAY(
          SELECT slug FROM releases as r WHERE r.link_ids @> ARRAY[links.id]
        ) AS release_slugs
      FROM links
      ORDER BY links.updated_at DESC
      LIMIT ${DEFAULT_PAGE_SIZE};
    `
    const formatted = formatResponseWithCursor(data, 'url', dashboardLinkSchema)
    const res: ResponseWithCursor<DashboardLink> = {
      ...formatted,
      totalCount
    }
    return res
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

/** Only the press links */
export async function fetchPressLinks () {
  try {
    const data = await sql<Link>`
      SELECT * FROM links
      WHERE type = 'press'
      ORDER BY publish_date DESC, created_at DESC
    `
    return data.rows.map(row => formatDbResponseForClient(row, linkSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch press links.')
  }
}

/** links to social media profiles */
export async function fetchSocialLinks () {
  try {
    const data = await sql<Link>`
      SELECT * FROM links
      WHERE type = 'social'
      AND title IS NOT NULL
      ORDER BY title ASC
    `
    return data.rows.map(row => formatDbResponseForClient(row, linkSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

async function getTotalCount (query: string) {
  try {
    if (!query) {
      const result = await sql`SELECT COUNT(*)::int AS count FROM links`
      return result.rows[0].count
    }

    const like = `%${query}%`
    const result = await sql`
    SELECT COUNT(*)::int AS count
    FROM links
    WHERE
      url ILIKE ${like} OR
      title ILIKE ${like} OR
      quotation ILIKE ${like}
  `
    return result.rows[0].count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch link count.')
  }
}
