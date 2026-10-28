import { sql } from '@/lib/db'
import {
  type WithCoverImageUrls,
  withCoverImageUrls
} from '@/lib/embed-codes/cover-image-url'
import type { DashboardEmbedCode } from '@/lib/embed-codes/schemas/client'
import { dashboardEmbedCodeSchema } from '@/lib/embed-codes/schemas/client'
import { embedCodeSchema } from '@/lib/embed-codes/schemas/db'
import { runListFetch } from '@/lib/list-fetch'
import { EmbeddedItemTypes } from '@/lib/schemas'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  type ResponseWithCursor
} from '@/lib/util'

export const fetchEmbedCodesByIds = async (ids: string[]) => {
  try {
    const data = await sql`
      SELECT
        embed_codes.*,
        ARRAY(
          SELECT slug FROM events AS e
          WHERE e.embed_code_ids @> ARRAY[embed_codes.id]
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects AS p
          WHERE p.embed_code_ids @> ARRAY[embed_codes.id]
        ) AS project_slugs,
        ARRAY(
          SELECT slug FROM releases AS r
          WHERE r.embed_code_ids @> ARRAY[embed_codes.id]
        ) AS release_slugs
      FROM embed_codes
      WHERE id = ANY(${ids})
    `
    return data.map((row) =>
      withCoverImageUrls(
        formatDbResponseForClient(row, embedCodeSchema)
      )
    )
  } catch (cause) {
    throw new Error('Failed to fetch embed codes.', { cause })
  }
}

/**
 * dashboard: fetch all the embed codes
 */
export async function fetchEmbedCodesRaw(
  cursor?: string,
  query?: string
): Promise<
  ResponseWithCursor<DashboardEmbedCode & WithCoverImageUrls>
> {
  return runListFetch({
    cursor,
    query,
    itemType: EmbeddedItemTypes.embedCodes,
    schema: dashboardEmbedCodeSchema,
    cursorKey: 'id',
    transform: (items) => items.map(withCoverImageUrls),
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM embed_codes
      WHERE (
        ${like}::text IS NULL
        OR title ILIKE ${like}
        OR src ILIKE ${like}
        OR host ILIKE ${like}
        OR type ILIKE ${like}
        OR content_type ILIKE ${like}
        OR caption ILIKE ${like}
      )
    `,
    list: ({ like, cursorName, cursorId }) => sql`
      SELECT
        embed_codes.*,
        ARRAY(
          SELECT slug FROM events AS e
          WHERE e.embed_code_ids @> ARRAY[embed_codes.id]
        ) AS event_slugs,
        ARRAY(
          SELECT slug FROM projects AS p
          WHERE p.embed_code_ids @> ARRAY[embed_codes.id]
        ) AS project_slugs,
        ARRAY(
          SELECT slug FROM releases AS r
          WHERE r.embed_code_ids @> ARRAY[embed_codes.id]
        ) AS release_slugs
      FROM embed_codes
      WHERE (
        ${like}::text IS NULL
        OR title ILIKE ${like}
        OR src ILIKE ${like}
        OR host ILIKE ${like}
        OR type ILIKE ${like}
        OR content_type ILIKE ${like}
        OR caption ILIKE ${like}
      )
      AND (
        ${cursorName}::text IS NULL
        OR (embed_codes.updated_at, embed_codes.id) < (
          SELECT updated_at, id FROM embed_codes WHERE id = ${cursorId}
        )
      )
      ORDER BY
        updated_at DESC,
        id DESC
      LIMIT ${DEFAULT_PAGE_SIZE}
    `
  })
}
