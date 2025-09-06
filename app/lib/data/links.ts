import type { DashboardLink, Link } from '@/lib/definitions'
import { formatDbResponseForClient } from '@/ui/util'
import { type QueryResultRow, sql } from '@vercel/postgres'
import { dashboardLinkSchema, linkSchema } from '@/lib/scemas'

export const fetchLinksByIds = async (ids: QueryResultRow[string]) => {
  try {
    const data = await sql<Link>`
      SELECT * FROM links
      WHERE id = ANY(${ids})
      ORDER BY
      COALESCE(publish_date, created_at) DESC
    `
    return data.rows.map(row => formatDbResponseForClient(row, linkSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

/** dashboard: all the links */
export async function fetchLinks () {
  try {
    const data = await sql<DashboardLink>`
          SELECT
          links.*,
          ARRAY(
            SELECT slug FROM releases as r WHERE r.link_ids @> ARRAY[links.id]
          ) AS release_slugs,
          ARRAY(
            SELECT slug FROM events as e WHERE e.link_ids @> ARRAY[links.id]
          ) AS event_slugs
          FROM links
          ORDER BY links.updated_at DESC
        `
    return data.rows.map(row => formatDbResponseForClient(row, dashboardLinkSchema))
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
