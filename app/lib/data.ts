import type {
  AboutClient,
  EmbedCode,
  Event,
  EventClient,
  Image,
  Link,
  ReleaseClient,
  SiteSettingsClient
} from '@/lib/definitions'
import { isUpcomingDate, camelizeKeys } from '@/ui/util'
import { QueryResultRow, sql } from '@vercel/postgres'

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
  return {
    ...camelizeKeys(event),
    endDate: event.end_date ? new Date(event.end_date).toISOString() : undefined,
    startDate: new Date(event.start_date).toISOString(),
    venue: {
      name: event.venue_name,
      address: event.venue_address,
      city: event.venue_city,
      state: event.venue_state,
      country: event.venue_country,
      url: event.venue_url
    }
  }
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

type ItemArrays = EmbedCode | Image | Link

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

const fetchEmbedCodesByIds = async (ids: QueryResultRow[string]): Promise<EmbedCode[]> => {
  try {
    const { rows } = await sql`
      SELECT * FROM embed_codes
      WHERE id = ANY(${ids})
    `
    return formatItemArrayRows<EmbedCode>(rows, ids)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}

export const fetchEmbedCodes = async (): Promise<EmbedCode[]> => {
  try {
    const { rows } = await sql`
      SELECT 
      embed_codes.*,
      ARRAY(
        SELECT slug FROM releases as r WHERE r.embed_code_ids @> ARRAY[embed_codes.id]
      ) AS release_slugs,
      ARRAY(
        SELECT slug FROM events as e WHERE e.embed_code_ids @> ARRAY[embed_codes.id]
      ) AS event_slugs
      FROM embed_codes
      ORDER BY embed_codes.updated_at DESC
    `
    return formatItemArrayRows<EmbedCode>(rows, rows.map(row => row.id))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
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

const fetchLinksByIds = async (ids: QueryResultRow[string]): Promise<Link[]> => {
  try {
    const { rows } = await sql`
      SELECT * FROM links
      WHERE id = ANY(${ids})
    `
    return formatItemArrayRows<Link>(rows, ids)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

function formatItemArrayRows<T extends ItemArrays> (rows: QueryResultRow[], ids: QueryResultRow[string]): T[] {
  const sortedRows = rows.sort((a, b) => {
    const indexA = ids.findIndex((id: string) => id === a.id)
    const indexB = ids.findIndex((id: string) => id === b.id)
    return ids[indexA] - ids[indexB]
  })
  return sortedRows.map(i => camelizeKeys(i)) || []
}
