'use server'

import { sql } from '@/lib/db'
import { fetchCachedLinksFirstPage } from '@/lib/links/cached'
import { dashboardLinkSchema, linkSchema } from '@/lib/links/schemas'
import type { CreateLink, DashboardLink } from '@/lib/links/types'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor,
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
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
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
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch link.')
  }
}

export async function fetchLinks(cursor?: string, query?: string) {
  if (!cursor && !query) {
    return fetchCachedLinksFirstPage()
  }

  return fetchLinksRaw(cursor, query)
}

/**
 * dashboard: fetch all the links
 */
export async function fetchLinksRaw(cursor?: string, query?: string) {
  const totalCount = await getTotalCount(query)
  const decodedCursor = cursor ? decodeCursor(cursor) : undefined

  const like = query ? `%${query}%` : null
  const cursorName = decodedCursor?.name ?? null
  const cursorId = decodedCursor?.id ?? null

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
    const formatted = formatResponseWithCursor(
      data,
      'id',
      dashboardLinkSchema
    )
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

async function getTotalCount(query?: string) {
  try {
    const like = query ? `%${query}%` : null
    const result = await sql`
      SELECT COUNT(*)::int AS count
      FROM links
      WHERE (
        ${like}::text IS NULL
        OR url ILIKE ${like}
        OR title ILIKE ${like}
        OR quotation ILIKE ${like}
      )
    `
    return result[0].count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch link count.')
  }
}
