import { sql } from '@/lib/db'
import { runListFetch } from '@/lib/list-fetch'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  type ResponseWithCursor
} from '@/lib/util'
import { fetchCachedVenuesFirstPage } from '@/lib/venues/cached'
import {
  type DashboardVenue,
  dashboardVenueSchema
} from '@/lib/venues/schemas/client'

export async function fetchVenueById(id: string) {
  try {
    const data = await sql`
      SELECT
        venues.*,
        ARRAY(
          SELECT slug FROM events e
          WHERE e.venue_id = venues.id
        ) AS event_slugs
      FROM venues
      WHERE venues.id = ${id}
      LIMIT 1
    `
    if (data.length === 0) {
      return null
    } else {
      return formatDbResponseForClient(data[0], dashboardVenueSchema)
    }
  } catch (cause) {
    throw new Error('Failed to fetch venue.', { cause })
  }
}

export async function fetchVenues(cursor?: string, query?: string) {
  if (!cursor && !query) {
    return fetchCachedVenuesFirstPage()
  }

  return fetchVenuesRaw(cursor, query)
}

/**
 * dashboard: fetch all the venues
 */
export async function fetchVenuesRaw(
  cursor?: string,
  query?: string
): Promise<ResponseWithCursor<DashboardVenue>> {
  return runListFetch({
    cursor,
    query,
    itemType: 'venues',
    schema: dashboardVenueSchema,
    cursorKey: 'name',
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM venues
      WHERE (
        ${like}::text IS NULL
        OR venues.name ILIKE ${like}
        OR venues.address ILIKE ${like}
        OR venues.city ILIKE ${like}
        OR venues.state ILIKE ${like}
        OR venues.country ILIKE ${like}
      )
    `,
    list: ({ like, cursorName, cursorId }) => sql`
      SELECT
        venues.*,
        ARRAY(
            SELECT slug FROM events e
            WHERE e.venue_id = venues.id
        ) AS event_slugs
      FROM venues
      WHERE (
        ${like}::text IS NULL
        OR venues.name ILIKE ${like}
        OR venues.address ILIKE ${like}
        OR venues.city ILIKE ${like}
        OR venues.state ILIKE ${like}
        OR venues.country ILIKE ${like}
      )
      AND (
        ${cursorName}::text IS NULL
        OR LOWER(venues.name) > LOWER(${cursorName})
        OR (LOWER(venues.name) = LOWER(${cursorName}) AND venues.id > ${cursorId})
      )
      ORDER BY
        LOWER(venues.name) ASC,
        venues.id ASC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
  })
}
