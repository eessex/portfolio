import { sql } from '@vercel/postgres'

import { siteSettingsClientSchema } from '@/lib/site-settings/schemas'
import type { SiteSettingsClient } from '@/lib/site-settings/types'
import { formatDbResponseForClient } from '@/lib/util'

/** site title & image, SEO meta */
export async function fetchSiteSettings () {
  try {
    const data = await sql<SiteSettingsClient>`
      SELECT
        s.*,
        build_image_json(i) AS cover_image
      FROM site_settings s
      LEFT JOIN images i ON s.cover_image_id = i.id
    `
    if (data.rowCount === 0) {
      return
    }
    return formatDbResponseForClient(data.rows[0], siteSettingsClientSchema)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch site settings.')
  }
}
