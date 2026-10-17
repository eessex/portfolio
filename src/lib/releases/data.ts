import { sql } from '@/lib/db'
import { withEmbedCodeCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import { EmbedCodeTypes } from '@/lib/embed-codes/schemas/db'
import { runListFetch } from '@/lib/list-fetch'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
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
        (
          CASE
            WHEN COALESCE(r.cover_image_id, r.image_ids[1]) IS NOT NULL
            THEN (
              SELECT build_image_json(i)
              FROM images i
              WHERE i.id = COALESCE(r.cover_image_id, r.image_ids[1])
            )
          END
        ) AS cover_image,
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
            AND i.id != COALESCE(r.cover_image_id, r.image_ids[1])
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
          SELECT COALESCE(jsonb_agg(build_published_edition_json(pe)), '[]'::jsonb)
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
      formatDbResponseForClient(
        {
          ...data[0],
          path
        },
        releaseClientSchema
      )
    )
  } catch (cause) {
    throw new Error(`Failed to fetch ${pathSingular}: ${id}.`, {
      cause
    })
  }
}

export async function fetchReleases(
  isAuthed = false,
  projectId?: string,
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedReleasesFirstPage(isAuthed, projectId)
  }

  return fetchReleasesRaw(isAuthed, projectId, cursor, query)
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
      WHERE
        (${projectId}::uuid IS NULL OR r.project_id = ${projectId}::uuid)
        AND (${isAuthed}::boolean OR r.is_published = true)
        AND (
          ${like}::text IS NULL
          OR r.title ILIKE ${like}
          OR r.description ILIKE ${like}
        );
    `,
    list: ({ like, cursorName: cursorReleaseDate, cursorId }) => {
      return sql`
        SELECT
          r.*,
          ${path} AS path,
          (
            CASE
              WHEN COALESCE(r.cover_image_id, r.image_ids[1]) IS NOT NULL
              THEN (
                SELECT build_image_json(i)
                FROM images i
                WHERE i.id = COALESCE(r.cover_image_id, r.image_ids[1])
              )
            END
          ) AS cover_image,
          EXISTS (
            SELECT 1 FROM embed_codes ec
            WHERE ec.id = ANY(r.embed_code_ids) AND ec.type = ${EmbedCodeTypes.video}
          ) AS has_video,
          EXISTS (
            SELECT 1 FROM embed_codes ec
            WHERE ec.id = ANY(r.embed_code_ids) AND ec.type = ${EmbedCodeTypes.audio}
          ) AS has_audio,
          (
            SELECT COALESCE(jsonb_agg(build_published_edition_json(pe)), '[]'::jsonb)
            FROM published_editions pe
            WHERE pe.release_id = r.id
          ) AS published_editions
        FROM releases AS r
        LEFT JOIN projects p ON r.project_id = p.id
        WHERE
          (${projectId}::uuid IS NULL OR r.project_id = ${projectId}::uuid)
          AND (${isAuthed}::boolean OR r.is_published = true)
          AND (${like}::text IS NULL OR r.title ILIKE ${like} OR r.description ILIKE ${like})
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
