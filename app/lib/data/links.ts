import { formatItemArrayRows } from '@/lib/data'
import type { Link } from '@/lib/definitions'
import { camelizeKeys } from '@/ui/util'
import { type QueryResultRow, sql } from '@vercel/postgres'

export const fetchLinksByIds = async (ids: QueryResultRow[string]): Promise<Link[]> => {
  try {
    const { rows } = await sql`
      SELECT * FROM links
      WHERE id = ANY(${ids})
      ORDER BY
      COALESCE(published_date, created_at) DESC
    `
    return formatItemArrayRows<Link>(rows)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

/** dashboard: all the links */
export async function fetchLinks () {
  try {
    const { rows } = await sql`
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
    return formatItemArrayRows<Link>(rows, rows.map(row => row.id))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

/** Only the press links */
export async function fetchPressLinks (): Promise<Link[]> {
  try {
    const data = await sql`
      SELECT * FROM links
      WHERE is_press = true
      ORDER BY published_date DESC, created_at DESC
    `
    return data.rows.map(link => ({ ...camelizeKeys(link) }))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch press links.')
  }
}

/** links to social media profiles */
export async function fetchSocialLinks () {
  try {
    const data = await sql<Link>`
      SELECT title, url FROM links
      WHERE is_social_profile = true 
      AND title IS NOT NULL
      ORDER BY title ASC
    `
    return data.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}
