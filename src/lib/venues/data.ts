import { sql } from '@vercel/postgres'

import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatResponseWithCursor,
  type ResponseWithCursor
} from '@/lib/util'
import { dashboardVenueSchema } from '@/lib/venues/schemas'
import type { DashboardVenue } from '@/lib/venues/types'

export async function fetchVenues (cursor?: string) {
  const totalCount = await getTotalCount('')
  const decodedCursor = cursor ? decodeCursor(cursor) : undefined

  try {
    let data
    if (decodedCursor) {
      data = await sql<DashboardVenue>`
        SELECT
          venues.*,
          ARRAY(
            SELECT slug FROM events e
            WHERE e.venue_id = venues.id
          ) AS event_slugs
        FROM venues
        WHERE
          LOWER(venues.name) > LOWER(${decodedCursor.name})
          OR (LOWER(venues.name) = LOWER(${decodedCursor.name}) AND venues.id > ${decodedCursor.id})
        ORDER BY
          LOWER(venues.name) ASC,
          venues.id ASC
        LIMIT ${DEFAULT_PAGE_SIZE};
      `
    } else {
      data = await sql<DashboardVenue>`
        SELECT
          venues.*,
          ARRAY(
            SELECT slug FROM events as e
            WHERE e.venue_id = venues.id
          ) AS event_slugs
        FROM venues
        ORDER BY
          LOWER(venues.name) ASC,
          venues.id ASC
        LIMIT ${DEFAULT_PAGE_SIZE};
      `
    }
    const formatted = formatResponseWithCursor(data, 'name', dashboardVenueSchema)
    const res: ResponseWithCursor<DashboardVenue> = {
      ...formatted,
      totalCount
    }
    return res
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch venues.')
  }
}

async function getTotalCount (query: string) {
  try {
    if (!query) {
      const result = await sql`SELECT COUNT(*)::int AS count FROM venues`
      return result.rows[0].count
    }

    const like = `%${query}%`
    const result = await sql`
    SELECT COUNT(*)::int AS count
    FROM venues
    WHERE
      name ILIKE ${like} OR
      address ILIKE ${like} OR
      city ILIKE ${like} OR
      state ILIKE ${like} OR
      country ILIKE ${like}
  `
    return result.rows[0].count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch venue count.')
  }
}
