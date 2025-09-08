import { eventClientSchema } from '@/lib/events/schemas'
import type { EventClient, FetchEventsResult } from '@/lib/events/types'
import { formatDbResponseForClient, isUpcomingDate } from '@/ui/util'
import { sql } from '@vercel/postgres'

export async function fetchEvents (isAuthed: boolean = false) {
  try {
    const data = await sql<EventClient>`
      SELECT
        e.*,
        (
          SELECT build_venue_json(v)
          FROM venues v
          WHERE v.id = e.venue_id
        ) AS venue,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(e.cover_image_id, e.image_ids[1])
        ) AS cover_image
      FROM events as e
      WHERE ${isAuthed} OR e.is_published = true
      ORDER BY e.start_time DESC;
    `
    const parsedEvents = data.rows.map((event) => formatDbResponseForClient(event, eventClientSchema))
    const sortedEvents = sortEventsByCategory(parsedEvents)
    return sortedEvents
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch events.')
  }
}

export async function fetchEventBySlug (slug: string, isAuthed: boolean = false) {
  try {
    const data = await sql<EventClient>`
      SELECT
        e.*,
        (
          SELECT build_venue_json(v)
          FROM venues v
          WHERE v.id = e.venue_id
        ) AS venue,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(e.cover_image_id, e.image_ids[1])
        ) AS cover_image
      FROM events as e
      WHERE ${isAuthed} OR e.is_published = true
      AND e.slug = ${slug};
    `

    if (!data.rows[0]) {
      return
    }
    return formatDbResponseForClient(data.rows[0], eventClientSchema)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch event ${slug}.`)
  }
}

function sortEventsByCategory (events: EventClient[]): FetchEventsResult {
  const upcomingEvents = events.filter(event => isUpcomingDate(event.startTime))
    .sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    })
  const pastEvents = events.filter(event => !isUpcomingDate(event.startTime))
    .sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    })
  return { upcomingEvents, pastEvents }
}
