import type { Event, EventClient, Image, Link } from '@/lib/definitions'
import { sql } from '@vercel/postgres'

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

// TODO: split upcoming and past events, clean up query/schema
export async function fetchEvents () {
  try {
    const data = await sql<Event & {
      venue_name: string
      venue_address: string
      venue_city: string
      venue_state: string
      venue_country: string
      image_url: string
      image_caption: string
      image_aspect: number
    }>`
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
    const parsedEvents: EventClient[] = data.rows.map((event) => ({
      ...event,
      venue: {
        name: event.venue_name,
        address: event.venue_address,
        city: event.venue_city,
        state: event.venue_state,
        country: event.venue_country
      },
      // TODO: this is probably not really an array, test with 2 images
      images: [{
        url: event.image_url,
        caption: event.image_caption,
        aspect: event.image_aspect
      }]
    }))
    return parsedEvents
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch events.')
  }
}
