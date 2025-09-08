import type {
  Release,
  ReleaseClient
} from '@/lib/definitions'
import { fetchEmbedCodesByIds } from '@/lib/embed-codes/data'
import { fetchImagesByIds } from '@/lib/images/data'
import { fetchLinksByIds } from '@/lib/links/data'
import { camelizeKeys } from '@/ui/util'
import { sql } from '@vercel/postgres'

interface ImageMetaProperties {
  image_id: string
  image_url: string
  image_caption?: string
  image_aspect: number
}

export interface FetchReleasesResult {
  soloReleases: ReleaseClient[]
  singles: ReleaseClient[]
  compilations: ReleaseClient[]
  collaborativeReleases: ReleaseClient[]
  featuredOn: ReleaseClient[]
}

export async function fetchReleases (isAuthed: boolean): Promise<FetchReleasesResult> {
  try {
    const data = await sql<Release & ImageMetaProperties>`
      SELECT
        r.*,
        i.id as image_id,
        i.url as image_url,
        i.caption as image_caption,
        i.aspect as image_aspect
      FROM releases as r
      LEFT JOIN images as i ON i.id = ANY(r.image_ids)
      ORDER BY r.release_date DESC
    `
    const res: ReleaseClient[] = data.rows.map(release => ({
      ...camelizeKeys(release),
      images: [{
        id: release.image_id,
        url: release.image_url,
        caption: release.image_caption,
        aspect: release.image_aspect
      }]
    }))
    const authedEvents = isAuthed ? res : res.filter(release => release.isPublished)
    return sortReleasesByCategory(authedEvents)
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

export async function fetchReleaseBySlug (slug: string): Promise<ReleaseClient | undefined> {
  try {
    const data = await sql`
      SELECT * FROM releases
      WHERE slug = ${slug}
    `
    if (data.rowCount === 0) {
      return
    }

    const release = data.rows[0]
    const embedCodes = await fetchEmbedCodesByIds(release.embed_code_ids)
    const images = await fetchImagesByIds(release.image_ids)
    const links = await fetchLinksByIds(release.link_ids)

    return {
      ...camelizeKeys(release),
      embedCodes,
      images,
      links
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch release ${slug}.`)
  }
}
