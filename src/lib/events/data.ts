import { eventClientSchema } from '@/lib/events/schemas'
import type { EventClient, FetchEventsResult } from '@/lib/events/types'
import type { PagePathType } from '@/lib/types'
import { formatDbResponseForClient, isUpcomingDate } from '@/ui/util'
import { sql } from '@vercel/postgres'

const path: PagePathType = 'events'

export async function fetchEvents (isAuthed: boolean = false) {
  try {
    const data = await sql<EventClient>`
      SELECT
        e.*,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(e.cover_image_id, e.image_ids[1])
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_embed_code_json(ec)), '[]'::jsonb)
          FROM embed_codes ec
          WHERE ec.id = ANY(e.embed_code_ids)
            AND ec.id != e.embed_code_ids[1]
        ) AS embed_codes,
        (
          SELECT build_embed_code_json(ec)
          FROM embed_codes ec
          WHERE ec.id = e.embed_code_ids[1]
        ) AS featured_embed_code,
        (
          SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
          FROM images i
          WHERE i.id = ANY(e.image_ids)
            AND i.id != COALESCE(e.cover_image_id, e.image_ids[1])
        ) AS images,
        (
          SELECT COALESCE(jsonb_agg(build_link_json(l)), '[]'::jsonb)
          FROM links l
          WHERE l.id = ANY(e.link_ids)
        ) AS links,
        (
          SELECT build_venue_json(v)
          FROM venues v
          WHERE v.id = e.venue_id
        ) AS venue
      FROM events as e
      WHERE ${isAuthed} OR e.is_published = true
      ORDER BY e.start_time DESC;
    `
    const parsedEvents = data.rows.map(e => formatDbResponseForClient({ ...e, path }, eventClientSchema))
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
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(e.cover_image_id, e.image_ids[1])
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_embed_code_json(ec)), '[]'::jsonb)
          FROM embed_codes ec
          WHERE ec.id = ANY(e.embed_code_ids)
            AND ec.id != e.embed_code_ids[1]
        ) AS embed_codes,
        (
          SELECT build_embed_code_json(ec)
          FROM embed_codes ec
          WHERE ec.id = e.embed_code_ids[1]
        ) AS featured_embed_code,
        (
          SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
          FROM images i
          WHERE i.id = ANY(e.image_ids)
            AND i.id != COALESCE(e.cover_image_id, e.image_ids[1])
        ) AS images,
        (
          SELECT COALESCE(jsonb_agg(build_link_json(l)), '[]'::jsonb)
          FROM links l
          WHERE l.id = ANY(e.link_ids)
        ) AS links,
        (
          SELECT build_venue_json(v)
          FROM venues v
          WHERE v.id = e.venue_id
        ) AS venue
      FROM events as e
      WHERE (${isAuthed} OR e.is_published = true)
       AND e.slug = ${slug};
    `

    if (!data.rows[0]) {
      return
    }
    return formatDbResponseForClient({ ...data.rows[0], path }, eventClientSchema)
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
