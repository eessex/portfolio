import { fetchLinksByIds } from '@/lib/data/links'
import type {
  AboutClient,
  DashboardLink,
  Event,
  EventClient,
  Release,
  ReleaseClient,
  SiteSettingsClient,
} from '@/lib/definitions'
import { fetchEmbedCodesByIds } from '@/lib/embed-codes/data'
import type { DashboardEmbedCode } from '@/lib/embed-codes/types'
import { fetchImage, fetchImagesByIds } from '@/lib/images/data'
import type { DashboardImage, Image } from '@/lib/images/types'
import type { Venue } from '@/lib/venues/types'
import { camelizeKeys, isUpcomingDate } from '@/ui/util'
import { type QueryResultRow, sql } from '@vercel/postgres'

/** main page meta & image etc */
export async function fetchSiteSettings (): Promise<SiteSettingsClient | undefined> {
  try {
    const data = await sql`
      SELECT * FROM site_settings
    `
    if (data.rowCount === 0) {
      return
    }
    const settings = data.rows[0]
    let coverImage: Image | undefined
    if (settings.cover_image_id) {
      coverImage = await fetchImage(settings.cover_image_id)
    }
    const settingsClient: SiteSettingsClient = {
      ...camelizeKeys(settings),
      coverImage,
    }
    return settingsClient
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch site settings.')
  }
}

export async function fetchAboutPage (): Promise<AboutClient | undefined> {
  try {
    const data = await sql`
      SELECT * FROM about
    `
    if (data.rowCount === 0) {
      return
    }
    const about = data.rows[0]
    let coverImage: Image | undefined
    if (about.cover_image_id) {
      coverImage = await fetchImage(about.cover_image_id)
    }
    const aboutClient: AboutClient = {
      ...camelizeKeys(about),
      coverImage,
    }
    return aboutClient
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch about page data.')
  }
}

export interface ImageMetaProperties {
  image_id: string
  image_url: string
  image_caption?: string
  image_aspect: number
}

interface EventMetaProperties extends ImageMetaProperties {
  end_date?: string
  start_time: string
  venue_name: string
  venue_address: string
  venue_city: string
  venue_state: string
  venue_country: string
  venue_url?: string
  ticket_link?: string
}

export interface FetchEventsResult {
  upcomingEvents: EventClient[]
  pastEvents: EventClient[]
}

export interface FetchReleasesResult {
  soloReleases: ReleaseClient[]
  singles: ReleaseClient[]
  compilations: ReleaseClient[]
  collaborativeReleases: ReleaseClient[]
  featuredOn: ReleaseClient[]
}

export async function fetchEvents (isAuthed: boolean = false): Promise<FetchEventsResult> {
  try {
    const data = await sql<Event & EventMetaProperties>`
      SELECT
        e.*,
        v.name as venue_name,
        v.address as venue_address,
        v.city as venue_city,
        v.state as venue_state,
        v.country as venue_country,
        i.id as image_id,
        i.url as image_url,
        i.caption as image_caption,
        i.aspect as image_aspect
      FROM events as e
      LEFT JOIN venues v ON v.id = e.venue_id
      LEFT JOIN images i ON i.id = ANY(e.image_ids)
      ORDER BY e.start_time DESC;
    `
    const parsedEvents: EventClient[] = data.rows.map((event) => formatEvent(event))
    const authedEvents = isAuthed
      ? parsedEvents
      : parsedEvents.filter(event => event.isPublished)
    const sortedEvents = sortEventsByCategory(authedEvents)

    return sortedEvents
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch events.')
  }
}

function sortEventsByCategory (events: EventClient[]): FetchEventsResult {
  const upcomingEvents = events.filter(event => isUpcomingDate(event.startDate))
    .sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })
  const pastEvents = events.filter(event => !isUpcomingDate(event.startDate))
    .sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
  return { upcomingEvents, pastEvents }
}

export const fetchEventBySlug = async (slug: string) => {
  try {
    const data = await sql`
      SELECT
        e.*,
        v.name as venue_name,
        v.address as venue_address,
        v.city as venue_city,
        v.state as venue_state,
        v.country as venue_country,
        v.url as venue_url
      FROM events as e
      LEFT JOIN venues v ON v.id = e.venue_id
      WHERE e.slug = ${slug};
    `

    if (data.rowCount === 0) {
      return
    }
    const event = data.rows[0]
    const embedCodes = await fetchEmbedCodesByIds(event.embed_code_ids)
    const images = await fetchImagesByIds(event.image_ids)
    const links = await fetchLinksByIds(event.link_ids)

    return {
      ...formatEvent(event),
      embedCodes,
      images,
      links
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch event ${slug}.`)
  }
}

// TODO: standardize camel / snake formats
function formatEvent (event: QueryResultRow): EventClient {
  const images: Array<EventClient['images'][number]> = []

  if (event.image_url) {
    images.push({
      url: event.image_url,
      caption: event.image_caption || '',
      aspect: event.image_aspect || 1,
      id: event.image_id || '',
      tagIds: [],
      createdAt: new Date()
    })
  }

  const formattedEvent: EventClient = {
    ...camelizeKeys(event),
    endDate: event.end_date ? new Date(event.end_date).toISOString() : undefined,
    startDate: new Date(event.start_time).toISOString(),
    images,
    venue: {
      name: event.venue_name,
      address: event.venue_address,
      city: event.venue_city,
      state: event.venue_state,
      country: event.venue_country,
      url: event.venue_url
    }
  }
  return formattedEvent
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

export type ItemArrays = DashboardEmbedCode | DashboardImage | DashboardLink

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

export function formatItemArrayRows<T extends ItemArrays | Venue> (
  rows: QueryResultRow[],
  ids?: QueryResultRow[string]
): T[] {
  if (!ids || !ids.length) return rows.map(i => camelizeKeys(i)) || []

  const sortedRows = ids
    .map((id: string) => rows.find(row => row.id === id))
    .filter(Boolean) as QueryResultRow[]

  return sortedRows.map(i => camelizeKeys(i)) || []
}
