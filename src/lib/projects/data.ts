import { sql } from '@/lib/db'
import { withEmbedCodeCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import { EmbedCodeTypes } from '@/lib/embed-codes/schemas/db'
import { runListFetch } from '@/lib/list-fetch'
import { fetchCachedProjectsFirstPage } from '@/lib/projects/cached'
import { projectClientSchema } from '@/lib/projects/schemas'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import { PagePaths, pagePathSingulars } from '@/lib/schemas'
import type { PageItemResponseWithCursor } from '@/lib/types'
import {
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient
} from '@/lib/util'

const path = PagePaths.projects
const pathSingular = pagePathSingulars[path]

export type FetchProjectsOptions = {
  /**
   * Leave out the `is_default_project` project (rendered at `/about`),
   * e.g. for the `/projects` index. Pickers and static params keep it.
   */
  isDefaultExcluded?: boolean
}

export async function fetchProjects(
  isAuthed: boolean = false,
  cursor?: string,
  query?: string,
  { isDefaultExcluded = false }: FetchProjectsOptions = {}
) {
  if (!cursor && !query) {
    return fetchCachedProjectsFirstPage(isAuthed, isDefaultExcluded)
  }

  return fetchProjectsRaw(isAuthed, cursor, query, {
    isDefaultExcluded
  })
}

export async function fetchProjectsRaw(
  isAuthed: boolean = false,
  cursor?: string,
  query?: string,
  { isDefaultExcluded = false }: FetchProjectsOptions = {}
): Promise<
  PageItemResponseWithCursor<ProjectClient, FetchProjectsResult>
> {
  return runListFetch({
    cursor,
    query,
    itemType: path,
    schema: projectClientSchema,
    cursorKey: 'startDate',
    cursorExtra: (project) => ({
      hasEndDate: String(project.endDate != null)
    }),
    transform: (projects) => ({ allProjects: projects }),
    count: (like) => sql`
      SELECT COUNT(*)::int AS count
      FROM projects AS p
      WHERE (${isAuthed} OR p.is_published = true)
      AND (NOT ${isDefaultExcluded} OR NOT p.is_default_project)
      AND (
        ${like}::text IS NULL
        OR p.title ILIKE ${like}
        OR p.description ILIKE ${like}
      );
    `,
    list: ({
      like,
      cursorName: cursorStartDate,
      cursorId,
      cursor: decodedCursor
    }) => {
      const cursorHasEndDate = decodedCursor?.hasEndDate ?? null

      return sql`
        SELECT
          p.*,
          ${path} AS path,
          (
            CASE
              WHEN COALESCE(p.cover_image_id, p.image_ids[1]) IS NOT NULL
              THEN (
                SELECT build_image_json(i)
                FROM images i
                WHERE i.id = COALESCE(p.cover_image_id, p.image_ids[1])
              )
            END
          ) AS cover_image,
          EXISTS (
            SELECT 1 FROM embed_codes ec
            WHERE ec.id = ANY(p.embed_code_ids)
              AND ec.type = ${EmbedCodeTypes.video}
          ) AS has_video,
          EXISTS (
            SELECT 1 FROM embed_codes ec
            WHERE ec.id = ANY(p.embed_code_ids)
              AND ec.type = ${EmbedCodeTypes.audio}
          ) AS has_audio
        FROM projects AS p
        WHERE
          (${isAuthed} OR p.is_published = true)
          AND (NOT ${isDefaultExcluded} OR NOT p.is_default_project)
          AND (${like}::text IS NULL OR p.title ILIKE ${like} OR p.description ILIKE ${like})
          AND (${cursorHasEndDate}::text IS NULL
          OR (
            (p.end_date IS NOT NULL)::text < ${cursorHasEndDate}::text
            OR (
              (p.end_date IS NOT NULL)::text = ${cursorHasEndDate}::text
              AND p.start_date < ${cursorStartDate}::timestamptz
            )
            OR (
              (p.end_date IS NOT NULL)::text = ${cursorHasEndDate}::text
              AND p.start_date = ${cursorStartDate}::timestamptz
              AND p.id > ${cursorId}::uuid
            )
          )
        )
        ORDER BY
          (p.end_date IS NOT NULL),
          p.start_date DESC,
          p.id ASC
        LIMIT ${DEFAULT_PAGE_SIZE}
      ;`
    }
  })
}

export async function fetchProjectById(
  id: string,
  isAuthed: boolean = false
) {
  try {
    const data = await sql`
      SELECT
        p.*,
        (
          CASE
            WHEN COALESCE(p.cover_image_id, p.image_ids[1]) IS NOT NULL
            THEN (
              SELECT build_image_json(i)
              FROM images i
              WHERE i.id = COALESCE(p.cover_image_id, p.image_ids[1])
            )
          END
        ) AS cover_image,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_embed_code_json(ec)
              ORDER BY array_position(p.embed_code_ids, ec.id)
            ),
            '[]'::jsonb
          )
          FROM embed_codes ec
          WHERE ec.id = ANY(p.embed_code_ids)
        ) AS embed_codes,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_image_json(i)
              ORDER BY array_position(p.image_ids, i.id)
            ),
            '[]'::jsonb
          )
          FROM images i
          WHERE i.id = ANY(p.image_ids)
            AND i.id != COALESCE(p.cover_image_id, p.image_ids[1])
        ) AS images,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_link_json(l)
              ORDER BY array_position(p.link_ids, l.id)
            ),
            '[]'::jsonb
          )
          FROM links l
          WHERE l.id = ANY(p.link_ids)
        ) AS links
      FROM projects as p
      WHERE p.id = ${id}
        AND (${isAuthed} OR p.is_published = true)
      LIMIT 1
    ;`
    if (data.length === 0) {
      return undefined
    }
    return withEmbedCodeCoverImageUrls(
      formatDbResponseForClient(
        {
          ...data[0],
          path
        },
        projectClientSchema
      )
    )
  } catch (cause) {
    throw new Error(`Failed to fetch ${pathSingular}: ${id}.`, {
      cause
    })
  }
}

/**
 * The project flagged `is_default_project` (rendered at `/about`), or
 * `undefined` when none exists yet. Looks up the id, then reuses
 * `fetchProjectById` for the full row.
 */
export async function fetchDefaultProject(isAuthed: boolean = false) {
  let rows
  try {
    rows = await sql`
      SELECT id FROM projects
      WHERE is_default_project
        AND (${isAuthed} OR is_published = true)
      LIMIT 1
    `
  } catch (cause) {
    throw new Error(`Failed to fetch default ${pathSingular}.`, {
      cause
    })
  }
  if (rows.length === 0) {
    return undefined
  }
  return fetchProjectById(rows[0].id, isAuthed)
}
