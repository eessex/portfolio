import { sql } from '@/lib/db'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import { releaseClientSchema } from '@/lib/releases/schemas'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { PagePaths } from '@/lib/schemas'
import type { PageItemResponseWithCursor } from '@/lib/types'
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  formatDbResponseForClient,
  formatResponseWithCursor
} from '@/lib/util'

const path = PagePaths.releases

export async function fetchReleaseBySlug(
  slug: string,
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
       AND r.slug = ${slug}
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
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch release ${slug}.`)
  }
}

export async function fetchReleases(
  isAuthed = false,
  projectSlug?: string,
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedReleasesFirstPage(isAuthed, projectSlug)
  }

  return fetchReleasesRaw(isAuthed, projectSlug, cursor, query)
}

export async function fetchReleasesRaw(
  isAuthed: boolean = false,
  projectSlug?: string,
  cursor?: string,
  query?: string
) {
  const totalCount = await getTotalCount(isAuthed, projectSlug, query)
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
        (${projectSlug}::text IS NULL OR p.slug = ${projectSlug}::text)
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
      res: sortReleasesByCategory(formatted.res, !!projectSlug),
      nextCursor: formatted.nextCursor,
      totalCount
    }

    return res
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch releases.')
  }
}

const sortReleasesByCategory = (
  releases: ReleaseClient[],
  isProject: boolean
) => {
  const result: FetchReleasesResult = {
    albums: [],
    soundtracks: [],
    eps: [],
    singlesAndCompilations: [],
    collaborativeReleases: [],
    featuredOn: [],
    everythingElse: [],
    releases: [] // For project pages, pages where there's only a couple releases
  }

  const hasMultipleTypes =
    new Set(releases.map((r) => r.type)).size > 1

  if (isProject && !hasMultipleTypes) {
    result.releases = [...releases]
    return result
  }

  for (const release of releases) {
    switch (release.type) {
      case 'album':
        result.albums.push(release)
        break
      case 'single':
      case 'compilation':
        result.singlesAndCompilations.push(release)
        break
      case 'soundtrack':
        result.soundtracks.push(release)
        break
      case 'collaborative_release':
        result.collaborativeReleases.push(release)
        break
      case 'feature':
        result.featuredOn.push(release)
        break
      case 'ep':
        result.eps.push(release)
        break
      default:
        result.everythingElse.push(release)
    }
  }

  return result
}

async function getTotalCount(
  isAuthed: boolean,
  projectSlug?: string,
  query?: string
) {
  try {
    const like = query ? `%${query}%` : null
    const data = await sql`
      SELECT COUNT(*)::int AS count
      FROM releases AS r
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE
        (${projectSlug}::text IS NULL OR p.slug = ${projectSlug}::text)
        AND (${isAuthed}::boolean OR r.is_published = true)
        AND (
          ${like}::text IS NULL
          OR r.title ILIKE ${like}
          OR r.description ILIKE ${like}
      );
    `
    return data[0]?.count ?? 0
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch releases count.')
  }
}
