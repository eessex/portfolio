import { sql } from '@/lib/db'
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
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor
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
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(r.cover_image_id, r.image_ids[1])
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_embed_code_json(ec)), '[]'::jsonb)
          FROM embed_codes ec
          WHERE ec.id = ANY(r.embed_code_ids)
            AND ec.id != r.embed_code_ids[1]
        ) AS embed_codes,
        (
          SELECT build_embed_code_json(ec)
          FROM embed_codes ec
          WHERE ec.id = r.embed_code_ids[1]
        ) AS featured_embed_code,
        (
          SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
          FROM images i
          WHERE i.id = ANY(r.image_ids)
            AND i.id != COALESCE(r.cover_image_id, r.image_ids[1])
        ) AS images,
        (
          SELECT COALESCE(jsonb_agg(build_link_json(l)), '[]'::jsonb)
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
    return formatDbResponseForClient(
      {
        ...data[0],
        path
      },
      releaseClientSchema
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
) {
  const totalCount = await getTotalCount(isAuthed, projectId, query)
  const decodedCursor = cursor ? decodeCursor(cursor) : null
  const cursorReleaseDate = decodedCursor?.releaseDate ?? null
  const cursorId = decodedCursor?.id ?? null
  const like = query ? `%${query}%` : null

  try {
    const data = await sql`
      SELECT
        r.*,
        ${path} AS path,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(r.cover_image_id, r.image_ids[1])
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_embed_code_json(ec)), '[]'::jsonb)
          FROM embed_codes ec
          WHERE ec.id = ANY(r.embed_code_ids)
        ) AS embed_codes,
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
    const formatted = formatResponseWithCursor(
      data,
      'id',
      releaseClientSchema
    )
    const res: PageItemResponseWithCursor<
      ReleaseClient,
      FetchReleasesResult
    > = {
      res: sortReleasesByCategory(formatted.res, !!projectId),
      nextCursor: formatted.nextCursor,
      totalCount
    }

    return res
  } catch (cause) {
    throw new Error(`Failed to fetch ${path}.`, {
      cause
    })
  }
}

async function getTotalCount(
  isAuthed: boolean,
  projectId?: string,
  query?: string
) {
  try {
    const like = query ? `%${query}%` : null

    const data = await sql`
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
    `

    return data[0]?.count ?? 0
  } catch (cause) {
    throw new Error(`Failed to fetch ${pathSingular} count.`, {
      cause
    })
  }
}
