import { sql } from '@/lib/db'
import { fetchCachedProjectsFirstPage } from '@/lib/projects/cached'
import { projectClientSchema } from '@/lib/projects/schemas'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import { PagePaths } from '@/lib/schemas'
import type { PageItemResponseWithCursor } from '@/lib/types'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor
} from '@/lib/util'
import { singularizePath } from '@/ui/util'

const path = PagePaths.projects
const pathSingular = singularizePath(path)

export async function fetchProjects(
  isAuthed: boolean = false,
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedProjectsFirstPage(isAuthed)
  }

  return fetchProjectsRaw(isAuthed, cursor, query)
}

export async function fetchProjectsRaw(
  isAuthed: boolean = false,
  cursor?: string,
  query?: string
) {
  const totalCount = await getTotalCount(isAuthed, query)
  const decodedCursor = cursor ? decodeCursor(cursor) : null
  const cursorHasEndDate = decodedCursor?.hasEndDate ?? null
  const cursorStartDate = decodedCursor?.startDate ?? null
  const cursorId = decodedCursor?.id ?? null
  const like = query ? `%${query}%` : null

  try {
    const data = await sql`
      SELECT
        p.*,
        ${path} AS path,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(p.cover_image_id, p.image_ids[1])
        ) AS cover_image
      FROM projects AS p
      WHERE
        (${isAuthed} OR p.is_published = true)
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
    const formatted = formatResponseWithCursor(
      data,
      'id',
      projectClientSchema
    )
    const res: PageItemResponseWithCursor<
      ProjectClient,
      FetchProjectsResult
    > = {
      res: { allProjects: formatted.res },
      nextCursor: formatted.nextCursor,
      totalCount
    }
    return res
  } catch (cause) {
    throw new Error(`Failed to fetch ${path}.`, { cause })
  }
}

export async function fetchProjectById(
  id: string,
  isAuthed: boolean = false
): Promise<ProjectClient | undefined> {
  try {
    const data = await sql`
      SELECT
        p.*,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(p.cover_image_id, p.image_ids[1])
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_embed_code_json(ec)), '[]'::jsonb)
          FROM embed_codes ec
          WHERE ec.id = ANY(p.embed_code_ids)
            AND ec.id != p.embed_code_ids[1]
        ) AS embed_codes,
        (
          SELECT build_embed_code_json(ec)
          FROM embed_codes ec
          WHERE ec.id = p.embed_code_ids[1]
        ) AS featured_embed_code,
        (
          SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
          FROM images i
          WHERE i.id = ANY(p.image_ids)
            AND i.id != COALESCE(p.cover_image_id, p.image_ids[1])
        ) AS images,
        (
          SELECT COALESCE(jsonb_agg(build_link_json(l)), '[]'::jsonb)
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
    const project = formatDbResponseForClient(
      {
        ...data[0],
        path
      },
      projectClientSchema
    )
    return project
  } catch (cause) {
    throw new Error(`Failed to fetch ${pathSingular}: ${id}.`, {
      cause
    })
  }
}

export async function getTotalCount(
  isAuthed: boolean = false,
  query?: string
) {
  try {
    const like = query ? `%${query}%` : null
    const data = await sql`
      SELECT COUNT(*)::int AS count
      FROM projects AS p
      WHERE (${isAuthed} OR p.is_published = true)
      AND (
        ${like}::text IS NULL
        OR p.title ILIKE ${like}
        OR p.description ILIKE ${like}
      );
    `
    return data[0]?.count ?? 0
  } catch (cause) {
    throw new Error(`Failed to fetch ${pathSingular} count.`, {
      cause
    })
  }
}
