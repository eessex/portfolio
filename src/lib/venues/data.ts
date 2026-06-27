'use server'

import { sql } from '@/lib/db'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor,
  type ResponseWithCursor
} from '@/lib/util'
import { dashboardVenueSchema } from '@/lib/venues/schemas'
import type { CreateVenue, DashboardVenue } from '@/lib/venues/types'

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
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch venue.')
  }
}

/**
 * dashboard: fetch all the venues
 */
export async function fetchVenues(cursor?: string, query?: string) {
  const totalCount = await getTotalCount(query)
  const decodedCursor = cursor ? decodeCursor(cursor) : undefined

  const like = query ? `%${query}%` : null
  const cursorName = decodedCursor?.name ?? null
  const cursorId = decodedCursor?.id ?? null

  try {
    const data = await sql`
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

    const formatted = formatResponseWithCursor(
      data,
      'name',
      dashboardVenueSchema
    )

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

export async function fetchSimilarVenue(venue: CreateVenue) {
  try {
    const data = await sql`
      SELECT
        venues.*,
        ARRAY(
          SELECT slug FROM events e
          WHERE e.venue_id = venues.id
        ) AS event_slugs
      FROM venues
      WHERE (
        (
          venues.name = ${venue.name}
          AND (venues.state = ${venue.state} OR venues.city = ${venue.city})
        )
      ) OR (
        venues.address = ${venue.address}
        AND (venues.city = ${venue.city} OR venues.state = ${venue.state})
      )
      LIMIT 1
    `
    if (data.length === 0) {
      return null
    } else {
      return {
        res: formatDbResponseForClient(data[0], dashboardVenueSchema),
        fieldName: 'similar' as keyof CreateVenue
      }
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch similar venues.')
  }
}

async function getTotalCount(query?: string) {
  try {
    const like = query ? `%${query}%` : null
    const result = await sql`
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
    `
    return result[0]?.count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch venue count.')
  }
}
