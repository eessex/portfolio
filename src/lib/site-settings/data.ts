import { sql } from '@/lib/db'
import { siteSettingsClientSchema } from '@/lib/site-settings/schemas'
import { formatDbResponseForClient } from '@/lib/util'
import { cacheTag } from 'next/cache'

/** site title & image, SEO meta */
export async function fetchSiteSettings() {
  'use cache'
  cacheTag('settings')

  try {
    const data = await sql`
      SELECT
        s.*,
        build_image_json(i) AS cover_image
      FROM site_settings s
      LEFT JOIN images i ON s.cover_image_id = i.id
    `
    if (data.length === 0) {
      return
    }
    return formatDbResponseForClient(
      data[0],
      siteSettingsClientSchema
    )
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch site settings.')
  }
}
