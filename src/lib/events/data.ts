import { sql } from '@vercel/postgres'

import { eventClientSchema } from '@/lib/events/schemas'
import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import type {
  PageItemResponseWithCursor,
  PagePathType
} from '@/lib/types'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor
} from '@/lib/util'
import { isUpcomingDate } from '@/ui/util'

const path: PagePathType = 'events'

export async function fetchEvents (isAuthed: boolean = false, projectSlug?: string, cursor?: string, query?: string) {
  const totalCount = await getTotalCount(isAuthed, projectSlug, query)
  const decodedCursor = cursor ? decodeCursor(cursor) : undefined
  const like = query ? `%${query}%` : null
  const cursorStartTime = decodedCursor?.startTime ?? null
  const cursorId = decodedCursor?.id ?? null

  try {
    const data = await sql<EventClient>`
      SELECT
        e.*,
        ${path} AS path,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(e.cover_image_id, e.image_ids[1])
        ) AS cover_image,
        (
          SELECT build_venue_json(v)
          FROM venues v
          WHERE v.id = e.venue_id
        ) AS venue
      FROM events AS e
      LEFT JOIN projects AS p ON e.project_id = p.id
      WHERE
        (${projectSlug}::text IS NULL OR p.slug = ${projectSlug}::text)
        AND (${isAuthed} OR e.is_published = true)
        AND (${like}::text IS NULL OR e.title ILIKE ${like} OR e.description ILIKE ${like})
        AND (
          ${cursorStartTime}::timestamptz IS NULL
          OR (
            e.start_time < ${cursorStartTime}::timestamptz
            OR (e.start_time = ${cursorStartTime}::timestamptz AND e.id > ${cursorId})
          )
        )
      ORDER BY e.start_time DESC, e.id ASC
      LIMIT ${DEFAULT_PAGE_SIZE};
    `
    const formatted = formatResponseWithCursor(data, 'id', eventClientSchema)
    const res: PageItemResponseWithCursor<EventClient, FetchEventsResult> = {
      res: sortEventsByCategory(formatted.res),
      nextCursor: formatted.nextCursor,
      totalCount
    }
    return res
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
          SELECT build_project_json(p)
          FROM projects p
          WHERE p.id = e.project_id
            AND (${isAuthed} OR p.is_published = true)
        ) AS project,
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
    return formatDbResponseForClient({
      ...data.rows[0],
      path
    }, eventClientSchema)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch event: ${slug}.`)
  }
}

export function sortEventsByCategory (events: EventClient[]): FetchEventsResult {
  const upcomingEvents = events.filter(event => isUpcomingDate(event.startTime))
    .sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    })
  const pastEvents = events.filter(event => !isUpcomingDate(event.startTime))
    .sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    })
  return {
    upcomingEvents,
    pastEvents
  }
}

async function getTotalCount (isAuthed: boolean = false, projectSlug?: string, query?: string) {
  try {
    const like = query ? `%${query}%` : null
    const data = await sql<{ count: number }>`
      SELECT COUNT(*)::int AS count
      FROM events AS e
      LEFT JOIN projects AS p ON e.project_id = p.id
      WHERE (
        ${projectSlug}::text IS NULL OR p.slug = ${projectSlug}::text
      )
      AND (${isAuthed} OR e.is_published = true)
      AND (
        ${like}::text IS NULL
        OR e.title ILIKE ${like}
        OR e.description ILIKE ${like}
      );
    `
    return data.rows[0]?.count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch event count.')
  }
}
