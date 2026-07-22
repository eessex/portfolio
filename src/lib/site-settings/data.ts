import { sql } from '@/lib/db'
import { siteSettingsClientSchema } from '@/lib/site-settings/schemas'
import { formatDbResponseForClient } from '@/lib/util'

/** site title & image, SEO meta */
export async function fetchSiteSettings() {
  try {
    const data = await sql`
      SELECT
        s.*,
        (
          CASE
            WHEN s.cover_image_id IS NOT NULL
            THEN (
              SELECT build_image_json(i)
              FROM images i
              WHERE i.id = s.cover_image_id
            )
          END
        ) AS cover_image
      FROM site_settings s
    `
    if (data.length === 0) {
      return
    }
    return formatDbResponseForClient(
      data[0],
      siteSettingsClientSchema
    )
  } catch (cause) {
    throw new Error('Failed to fetch site settings.', { cause })
  }
}
