import { releaseClientSchema } from '@/lib/releases/schemas'
import type { FetchReleasesResult, ReleaseClient } from '@/lib/releases/types'
import type { PagePathType } from '@/lib/types'
import { formatDbResponseForClient } from '@/ui/util'
import { sql } from '@vercel/postgres'

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
          SELECT COALESCE(jsonb_agg(build_embed_code_json(e)), '[]'::jsonb)
          FROM embed_codes e
          WHERE e.id = ANY(r.embed_code_ids)
            AND e.id != r.embed_code_ids[1]
        ) AS embed_codes,
        (
          SELECT build_embed_code_json(e)
          FROM embed_codes e
          WHERE e.id = r.embed_code_ids[1]
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
    return formatDbResponseForClient({ ...data.rows[0], path }, releaseClientSchema)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch release ${slug}.`)
  }
}

export async function fetchReleases (isAuthed: boolean = false) {
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
          SELECT COALESCE(jsonb_agg(build_published_edition_json(pe)), '[]'::jsonb)
          FROM published_editions pe
          WHERE pe.release_id = r.id
        ) AS published_editions
      FROM releases as r
      WHERE ${isAuthed} OR r.is_published = true
      ORDER BY r.release_date DESC
    `
    const parsedReleases = data.rows.map(r => formatDbResponseForClient({ ...r, path }, releaseClientSchema))
    return sortReleasesByCategory(parsedReleases)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch releases.')
  }
}

const sortReleasesByCategory = (releases: ReleaseClient[]) => {
  const result: FetchReleasesResult = {
    soloReleases: [],
    singles: [],
    collaborativeReleases: [],
    compilations: [],
    featuredOn: []
  }

  for (const release of releases) {
    switch (release.type) {
      case 'single':
        result.singles.push(release)
        break
      case 'collaborative_release':
        result.collaborativeReleases.push(release)
        break
      case 'compilation':
        result.compilations.push(release)
        break
      case 'feature':
        result.featuredOn.push(release)
        break
      default:
        result.soloReleases.push(release)
    }
  }

  return result
}
