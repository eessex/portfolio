import { sql } from '@/lib/db'
import { withEmbedCodeCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import { EmbedCodeTypes } from '@/lib/embed-codes/schemas/db'
import { eventClientSchema } from '@/lib/events/schemas'
import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import { sortEventsByCategory } from '@/lib/events/util'
import { runListFetch } from '@/lib/list-fetch'
import { PagePaths, pagePathSingulars } from '@/lib/schemas'
import type { PageItemResponseWithCursor } from '@/lib/types'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient
} from '@/lib/util'

const path = PagePaths.events
const pathSingular = pagePathSingulars[path]

export async function fetchEventsRaw(
  isAuthed: boolean = false,
  projectId?: string,
  cursor?: string,
  query?: string
): Promise<
  PageItemResponseWithCursor<EventClient, FetchEventsResult>
> {
  return runListFetch({
    cursor,
    query,
    itemType: path,
    schema: eventClientSchema,
    cursorKey: 'startTime',
    transform: (events) => sortEventsByCategory(events),
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM events AS e
      LEFT JOIN projects AS p ON e.project_id = p.id
      LEFT JOIN venues AS v ON e.venue_id = v.id
      WHERE
        (${projectId}::uuid IS NULL OR e.project_id = ${projectId}::uuid)
        AND (${isAuthed} OR e.is_published = true)
        AND (
          ${like}::text IS NULL
          OR e.title ILIKE ${like}
          OR e.short_description ILIKE ${like}
          OR e.description ILIKE ${like}
          OR COALESCE(v.name, '') ILIKE ${like}
          OR COALESCE(v.address, '') ILIKE ${like}
          OR COALESCE(v.city, '') ILIKE ${like}
          OR COALESCE(v.state, '') ILIKE ${like}
          OR COALESCE(v.country, '') ILIKE ${like}
        );
    `,
    list: ({ like, cursorName: cursorStartTime, cursorId }) => sql`
      SELECT
        e.*,
        ${path} AS path,
        e.start_time > now() AS is_upcoming,
        has_embed_code_type(e.embed_code_ids, ${EmbedCodeTypes.video}) AS has_video,
        has_embed_code_type(e.embed_code_ids, ${EmbedCodeTypes.audio}) AS has_audio,
        build_cover_image_json(e.cover_image_id, e.image_ids) AS cover_image,
        (
          SELECT build_venue_json(v)
          FROM venues v
          WHERE v.id = e.venue_id
        ) AS venue
      FROM events AS e
      LEFT JOIN projects AS p ON e.project_id = p.id
      LEFT JOIN venues AS v ON e.venue_id = v.id
      WHERE
        (${projectId}::uuid IS NULL OR e.project_id = ${projectId}::uuid)
        AND (${isAuthed} OR e.is_published = true)
        AND (
          ${like}::text IS NULL
          OR e.title ILIKE ${like}
          OR e.short_description ILIKE ${like}
          OR e.description ILIKE ${like}
          OR COALESCE(v.name, '') ILIKE ${like}
          OR COALESCE(v.address, '') ILIKE ${like}
          OR COALESCE(v.city, '') ILIKE ${like}
          OR COALESCE(v.state, '') ILIKE ${like}
          OR COALESCE(v.country, '') ILIKE ${like}
        )
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
  })
}

// upcoming events are a small, unpaginated set
export async function fetchUpcomingEventsRaw(
  isAuthed: boolean = false
) {
  try {
    const data = await sql`
      SELECT
        e.*,
        ${path} AS path,
        e.start_time > now() AS is_upcoming,
        has_embed_code_type(e.embed_code_ids, ${EmbedCodeTypes.video}) AS has_video,
        has_embed_code_type(e.embed_code_ids, ${EmbedCodeTypes.audio}) AS has_audio,
        build_cover_image_json(e.cover_image_id, e.image_ids) AS cover_image,
        (
          SELECT build_venue_json(v)
          FROM venues v
          WHERE v.id = e.venue_id
        ) AS venue
      FROM events AS e
      WHERE
        (${isAuthed} OR e.is_published = true)
        AND e.start_time > now()
      ORDER BY e.start_time ASC, e.id ASC;
    `
    return data.map((row) =>
      formatDbResponseForClient(row, eventClientSchema)
    )
  } catch (cause) {
    throw new Error(`Failed to fetch upcoming ${path}.`, { cause })
  }
}

export async function fetchEventById(
  id: string,
  isAuthed: boolean = false
) {
  try {
    const data = await sql`
      SELECT
        e.*,
        e.start_time > now() AS is_upcoming,
        build_cover_image_json(e.cover_image_id, e.image_ids) AS cover_image,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_embed_code_json(ec)
              ORDER BY array_position(e.embed_code_ids, ec.id)
            ),
            '[]'::jsonb
          )
          FROM embed_codes ec
          WHERE ec.id = ANY(e.embed_code_ids)
        ) AS embed_codes,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_image_json(i)
              ORDER BY array_position(e.image_ids, i.id)
            ),
            '[]'::jsonb
          )
          FROM images i
          WHERE i.id = ANY(e.image_ids)
            AND i.id != resolve_cover_image_id(e.cover_image_id, e.image_ids)
        ) AS images,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_link_json(l)
              ORDER BY array_position(e.link_ids, l.id)
            ),
            '[]'::jsonb
          )
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
       AND e.id = ${id};
    `

    if (!data[0]) {
      return
    }
    return withEmbedCodeCoverImageUrls(
      formatDbResponseForClient(
        {
          ...data[0],
          path
        },
        eventClientSchema
      )
    )
  } catch (cause) {
    throw new Error(`Failed to fetch ${pathSingular}: ${id}.`, {
      cause
    })
  }
}
