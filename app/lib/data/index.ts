import { fetchEmbedCodesByIds } from '@/lib/data/embed-codes'
import { fetchLinksByIds } from '@/lib/data/links'
import type {
  AboutClient,
  EmbedCode,
  Event,
  EventClient,
  Image,
  Link,
  ReleaseClient,
  SiteSettingsClient,
  Venue
} from '@/lib/definitions'
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

/** Only the press photos */
export async function fetchPressImages () {
  try {
    const data = await sql<Image>`
      SELECT * FROM images
      WHERE is_press = true
    `
    return data.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch press images.')
  }
}

/** Only the press links */
export async function fetchPressLinks (): Promise<Link[]> {
  try {
    const data = await sql`
      SELECT * FROM links
      WHERE is_press = true
      ORDER BY published_date DESC, created_at DESC
    `
    return data.rows.map(link => ({ ...camelizeKeys(link) }))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch press links.')
  }
}

/** links to social media profiles */
export async function fetchSocialLinks () {
  try {
    const data = await sql<Link>`
      SELECT title, url FROM links
      WHERE is_social_profile = true 
      AND title IS NOT NULL
      ORDER BY title ASC
    `
    return data.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

/** dev-only for now, show all the images */
export async function fetchImages () {
  try {
    const data = await sql<Image>`
      SELECT * FROM images
    `
    return data.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch images.')
  }
}

export async function fetchImage (id: string) {
  try {
    const data = await sql<Image>`
      SELECT * FROM images
      WHERE id = ${id}
    `
    if (data.rowCount === 0) {
      console.debug(`Image with id ${id} not found.`)
      return
    }
    return data.rows[0]
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch image ${id}.`)
  }
}

interface EventMetaProperties {
  end_date?: string
  start_date: string
  venue_name: string
  venue_address: string
  venue_city: string
  venue_state: string
  venue_country: string
  venue_url?: string
  image_url: string
  image_caption: string
  image_aspect: number
  ticket_link?: string
}

export async function fetchEvents (isAuthed: boolean = false) {
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
      ORDER BY e.start_date DESC;
    `
    const parsedEvents: EventClient[] = data.rows.map((event) => formatEvent(event))
    const authedEvents = isAuthed
      ? parsedEvents
      : parsedEvents.filter(event => event.isPublished)
    if (authedEvents.length === 0) {
      return { upcomingEvents: [], pastEvents: [] }
    }
    const upcomingEvents = authedEvents.filter(event => isUpcomingDate(event.startDate))
      .sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      })
    const pastEvents = authedEvents.filter(event => !isUpcomingDate(event.startDate))

    return { upcomingEvents, pastEvents }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch events.')
  }
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
    })
  }

  const formattedEvent: EventClient = {
    ...camelizeKeys(event),
    endDate: event.end_date ? new Date(event.end_date).toISOString() : undefined,
    startDate: new Date(event.start_date).toISOString(),
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

export async function fetchReleases (isAuthed: boolean): Promise<ReleaseClient[]> {
  try {
    const data = await sql`
      SELECT
        r.*,
        i.url as image_url,
        i.caption as image_caption,
        i.aspect as image_aspect
      FROM releases as r
      LEFT JOIN images as i ON i.id = ANY(r.image_ids)
      ORDER BY r.release_date DESC
    `
    const res = data.rows.map(release => ({
      ...camelizeKeys(release),
      images: [{
        url: release.image_url,
        caption: release.image_caption,
        aspect: release.image_aspect
      }]
    }))
    if (isAuthed) {
      return res
    } else {
      return res.filter(release => release.isPublished)
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch releases.')
  }
}

export type ItemArrays = EmbedCode | Image | Link

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

const fetchImagesByIds = async (ids: QueryResultRow[string]): Promise<Image[]> => {
  try {
    const { rows } = await sql`
      SELECT * FROM images
      WHERE id = ANY(${ids})
    `
    return formatItemArrayRows<Image>(rows, ids)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch images.')
  }
}

export function formatItemArrayRows<T extends ItemArrays | Venue> (
  rows: QueryResultRow[],
  ids: QueryResultRow[string],
  isSorted: boolean = true
): T[] {
  if (!ids) return []

  const sortedRows = isSorted
    ? ids
      .map((id: string) => rows.find(row => row.id === id))
      .filter(Boolean) as QueryResultRow[]
    : rows
  return sortedRows.map(i => camelizeKeys(i)) || []
}
