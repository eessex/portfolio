'use server'

import { sql } from '@/lib/db'
import { runListFetch } from '@/lib/list-fetch'
import { fetchCachedPublishersFirstPage } from '@/lib/publishers/cached'
import {
  type Publisher,
  publisherSchema
} from '@/lib/publishers/schemas/db'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  type ResponseWithCursor
} from '@/lib/util'

export async function fetchPublisherById(id: string) {
  try {
    const data = await sql`
      SELECT publishers.*
      FROM publishers
      WHERE publishers.id = ${id}
      LIMIT 1
    `
    if (data.length === 0) {
      return null
    } else {
      return formatDbResponseForClient(data[0], publisherSchema)
    }
  } catch (cause) {
    throw new Error('Failed to fetch publisher.', { cause })
  }
}

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
): Promise<ResponseWithCursor<Publisher>> {
  return runListFetch({
    cursor,
    query,
    itemType: 'publishers',
    schema: publisherSchema,
    cursorKey: 'name',
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM publishers
      WHERE (
        ${like}::text IS NULL
        OR publishers.name ILIKE ${like}
      )
    `,
    list: ({ like, cursorName, cursorId }) => sql`
      SELECT publishers.*
      FROM publishers
      WHERE (
        ${like}::text IS NULL
        OR publishers.name ILIKE ${like}
      )
      AND (
        ${cursorName}::text IS NULL
        OR LOWER(publishers.name) > LOWER(${cursorName})
        OR (LOWER(publishers.name) = LOWER(${cursorName}) AND publishers.id > ${cursorId})
      )
      ORDER BY
        LOWER(publishers.name) ASC,
        publishers.id ASC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
  })
}
