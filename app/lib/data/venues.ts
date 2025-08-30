import { sql } from '@vercel/postgres'
import { type Venue } from '@/lib/definitions'
import { formatItemArrayRows } from '@/lib/data'

export async function fetchVenues () {
  try {
    const { rows } = await sql`
      SELECT 
      venues.*,
      ARRAY(
      SELECT slug FROM events as e WHERE e.venue_id = venues.id
      ) AS event_slugs
      FROM venues
      ORDER BY LOWER(venues.name) ASC
    `
    return formatItemArrayRows<Venue>(rows)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch venues.')
  }
}
