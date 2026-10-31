import { sql } from '@/lib/db'
import { withEmbedCodeCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import { EmbedCodeTypes } from '@/lib/embed-codes/schemas/db'
import { runListFetch } from '@/lib/list-fetch'
import { releaseClientSchema } from '@/lib/releases/schemas'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { sortReleasesByCategory } from '@/lib/releases/util'
import { PagePaths, pagePathSingulars } from '@/lib/schemas'
import type { PageItemResponseWithCursor } from '@/lib/types'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient
} from '@/lib/util'

const path = PagePaths.releases
const pathSingular = pagePathSingulars[path]

export async function fetchReleaseById(
  id: string,
  isAuthed: boolean = false
) {
  try {
    const data = await sql`
      SELECT
        r.*,
        -- artist is saved on the release; the project's name only
        -- covers older rows without one (published or not)
        COALESCE(
          r.artist,
          (SELECT title FROM projects WHERE id = r.project_id)
        ) AS display_artist,
        build_cover_image_json(r.cover_image_id, r.image_ids) AS cover_image,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_embed_code_json(ec)
              ORDER BY array_position(r.embed_code_ids, ec.id)
            ),
            '[]'::jsonb
          )
          FROM embed_codes ec
          WHERE ec.id = ANY(r.embed_code_ids)
        ) AS embed_codes,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_image_json(i)
              ORDER BY array_position(r.image_ids, i.id)
            ),
            '[]'::jsonb
          )
          FROM images i
          WHERE i.id = ANY(r.image_ids)
            AND i.id != resolve_cover_image_id(r.cover_image_id, r.image_ids)
        ) AS images,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_link_json(l)
              ORDER BY array_position(r.link_ids, l.id)
            ),
            '[]'::jsonb
          )
          FROM links l
          WHERE l.id = ANY(r.link_ids)
        ) AS links,
        (
          SELECT build_project_json(p)
          FROM projects p
          WHERE p.id = r.project_id
            AND (${isAuthed} OR p.is_published = true)
        ) AS project,
        (
          SELECT COALESCE(jsonb_agg(build_published_edition_json(pe) ORDER BY pe.publish_date, pe.created_at), '[]'::jsonb)
          FROM published_editions pe
          WHERE pe.release_id = r.id
        ) AS published_editions
      FROM releases as r
      WHERE (${isAuthed} OR r.is_published = true)
       AND r.id = ${id}
    `
    if (data.length === 0) {
      return
    }
    return withEmbedCodeCoverImageUrls(
      formatDbResponseForClient(data[0], releaseClientSchema)
    )
  } catch (cause) {
    throw new Error(`Failed to fetch ${pathSingular}: ${id}.`, {
      cause
    })
  }
}

export async function fetchReleasesRaw(
  isAuthed: boolean = false,
  projectId?: string,
  cursor?: string,
  query?: string
): Promise<
  PageItemResponseWithCursor<ReleaseClient, FetchReleasesResult>
> {
  return runListFetch({
    cursor,
    query,
    itemType: path,
    schema: releaseClientSchema,
    cursorKey: 'releaseDate',
    transform: (releases) =>
      sortReleasesByCategory(releases, !!projectId),
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM releases AS r
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE
        (${projectId}::uuid IS NULL OR r.project_id = ${projectId}::uuid)
        AND (${isAuthed}::boolean OR r.is_published = true)
        AND (
          ${like}::text IS NULL
          OR r.title ILIKE ${like}
          OR r.short_description ILIKE ${like}
          OR r.description ILIKE ${like}
          OR r.type ILIKE ${like}
          OR COALESCE(r.artist, p.title) ILIKE ${like}
          OR EXISTS (
            SELECT 1
            FROM published_editions pe
            JOIN publishers pub ON pub.id = pe.publisher_id
            WHERE pe.release_id = r.id
              AND (
                pub.name ILIKE ${like}
                OR pe.catalog_number ILIKE ${like}
                OR pe.format ILIKE ${like}
              )
          )
        );
    `,
    list: ({ like, cursorName: cursorReleaseDate, cursorId }) => {
      return sql`
        SELECT
          r.*,
          COALESCE(r.artist, p.title) AS display_artist,
          build_cover_image_json(r.cover_image_id, r.image_ids) AS cover_image,
          has_embed_code_type(r.embed_code_ids, ${EmbedCodeTypes.video}) AS has_video,
          has_embed_code_type(r.embed_code_ids, ${EmbedCodeTypes.audio}) AS has_audio,
          (
            SELECT COALESCE(jsonb_agg(build_published_edition_json(pe) ORDER BY pe.publish_date, pe.created_at), '[]'::jsonb)
            FROM published_editions pe
            WHERE pe.release_id = r.id
          ) AS published_editions
        FROM releases AS r
        LEFT JOIN projects p ON r.project_id = p.id
        WHERE
          (${projectId}::uuid IS NULL OR r.project_id = ${projectId}::uuid)
          AND (${isAuthed}::boolean OR r.is_published = true)
          AND (
            ${like}::text IS NULL
            OR r.title ILIKE ${like}
            OR r.short_description ILIKE ${like}
            OR r.description ILIKE ${like}
            OR r.type ILIKE ${like}
            OR COALESCE(r.artist, p.title) ILIKE ${like}
            OR EXISTS (
              SELECT 1
              FROM published_editions pe
              JOIN publishers pub ON pub.id = pe.publisher_id
              WHERE pe.release_id = r.id
                AND (
                  pub.name ILIKE ${like}
                  OR pe.catalog_number ILIKE ${like}
                  OR pe.format ILIKE ${like}
                )
            )
          )
          AND (
            ${cursorReleaseDate}::timestamptz IS NULL
            OR (
              r.release_date < ${cursorReleaseDate}::timestamptz
              OR (r.release_date = ${cursorReleaseDate}::timestamptz AND r.id > ${cursorId}::uuid)
            )
          )
        ORDER BY r.release_date DESC, r.id ASC
        LIMIT ${DEFAULT_PAGE_SIZE};
      `
    }
  })
}
