import { sql } from '@vercel/postgres'

import { releaseClientSchema } from '@/lib/releases/schemas'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import type { PagePathType } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'

const path: PagePathType = 'releases'

export async function fetchReleaseBySlug (slug: string, isAuthed: boolean = false) {
  try {
    const data = await sql<ReleaseClient>`
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
    if (data.rowCount === 0) {
      return
    }
    return formatDbResponseForClient({
      ...data.rows[0],
      path
    }, releaseClientSchema)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch release ${slug}.`)
  }
}

export async function fetchReleases (isAuthed: boolean = false, projectSlug?: string) {
  try {
    let data
    if (projectSlug) {
      data = await sql<ReleaseClient>`
      SELECT
        r.*,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(r.cover_image_id, r.image_ids[1])
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_published_edition_json(pe)), '[]'::jsonb)
          FROM published_editions pe
          WHERE pe.release_id = r.id
        ) AS published_editions
      FROM releases as r
      JOIN projects p ON p.id = r.project_id
      WHERE p.slug = ${projectSlug}
        AND (${isAuthed} OR r.is_published = true)
      ORDER BY r.release_date DESC
    `
    } else {
      data = await sql<ReleaseClient>`
      SELECT
        r.*,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(r.cover_image_id, r.image_ids[1])
        ) AS cover_image,
        (
          SELECT COALESCE(jsonb_agg(build_published_edition_json(pe)), '[]'::jsonb)
          FROM published_editions pe
          WHERE pe.release_id = r.id
        ) AS published_editions
      FROM releases as r
      WHERE ${isAuthed} OR r.is_published = true
      ORDER BY r.release_date DESC
    `
    }
    const parsedReleases = data.rows.map(r => formatDbResponseForClient({
      ...r,
      path
    }, releaseClientSchema))
    return sortReleasesByCategory(parsedReleases, !!projectSlug)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch releases.')
  }
}

const sortReleasesByCategory = (releases: ReleaseClient[], isProject: boolean) => {
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

  const hasMultipleTypes = new Set(releases.map(r => r.type)).size > 1

  if (isProject && !hasMultipleTypes) {
    result.releases = releases
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
