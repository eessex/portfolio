import type { About, Event, EventClient, Image, Link, SiteSettings } from '@/lib/definitions'
import { isUpcomingDate, camelizeKeys } from '@/ui/util'
import { sql } from '@vercel/postgres'

/** main page meta & image etc */
export async function fetchSiteSettings () {
  try {
    const data = await sql<SiteSettings & { cover_image_url: string, cover_image_aspect: number, cover_image_caption?: string }>`
      SELECT 
        s.title,
        s.description,
        i.url as cover_image_url,
        i.aspect as cover_image_aspect,
        i.caption as cover_image_caption
      FROM site_settings as s
      JOIN images as i ON i.id = s.cover_image_id
    `
    if (data.rowCount === 0) {
      return
    }
    return {
      title: data.rows[0].title,
      description: data.rows[0].description,
      coverImage: {
        url: data.rows[0].cover_image_url,
        aspect: data.rows[0].cover_image_aspect,
        caption: data.rows[0].cover_image_caption
      }
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}

export async function fetchAboutPage () {
  try {
    const data = await sql<About & { cover_image_url: string, cover_image_aspect: number, cover_image_caption?: string }>`
      SELECT 
        s.title,
        s.description,
        i.url as cover_image_url,
        i.aspect as cover_image_aspect,
        i.caption as cover_image_caption
      FROM about as s
      JOIN images as i ON i.id = s.cover_image_id
    `
    if (data.rowCount === 0) {
      return
    }
    return {
      title: data.rows[0].title,
      description: data.rows[0].description,
      coverImage: {
        url: data.rows[0].cover_image_url,
        aspect: data.rows[0].cover_image_aspect,
        caption: data.rows[0].cover_image_caption
      }
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch about page data.')
  }
}

/** Only the press photos */
export async function fetchPressImages () {
  try {
    const data = await sql<Image>`
      SELECT aspect, caption, url FROM images
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
      SELECT caption, url, id FROM images
    `
    return data.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch images.')
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

export async function fetchEvents () {
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
    const upcomingEvents = parsedEvents.filter(event => isUpcomingDate(event.startDate))
      .sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      })
    const pastEvents = parsedEvents.filter(event => !isUpcomingDate(event.startDate))

    return { upcomingEvents, pastEvents }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch events.')
  }
}

export const fetchEventBySlug = async (slug: string) => {
  try {
    const data = await sql<Event & EventMetaProperties>`
      SELECT
        e.*,
        v.name as venue_name,
        v.address as venue_address,
        v.city as venue_city,
        v.state as venue_state,
        v.country as venue_country,
        v.url as venue_url,
        i.url as image_url,
        i.caption as image_caption,
        i.aspect as image_aspect
      FROM events as e
      LEFT JOIN venues v ON v.id = e.venue_id
      LEFT JOIN images i ON i.id = ANY(e.image_ids)
      WHERE e.slug = ${slug};
    `

    if (data.rowCount === 0) {
      return
    }
    return formatEvent(data.rows[0])
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch events.')
  }
}

// TODO: standardize camel / snake formats
function formatEvent (event: Event & EventMetaProperties): EventClient {
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
    },
    // TODO: handling for multiple images
    images: [{
      url: event.image_url,
      caption: event.image_caption,
      aspect: event.image_aspect
    }]
  }
}
