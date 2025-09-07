import { dashboardVenueSchema } from '@/lib/venues/schemas'
import type { DashboardVenue } from '@/lib/venues/types'
import { formatDbResponseForClient } from '@/ui/util'
import { sql } from '@vercel/postgres'

export async function fetchVenues () {
  try {
    const data = await sql<DashboardVenue>`
      SELECT 
      venues.*,
      ARRAY(
      SELECT slug FROM events as e WHERE e.venue_id = venues.id
      ) AS event_slugs
      FROM venues
      ORDER BY LOWER(venues.name) ASC
    `
    return data.rows.map(row => formatDbResponseForClient(row, dashboardVenueSchema))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch venues.')
  }
}
