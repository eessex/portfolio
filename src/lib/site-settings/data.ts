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
        ) AS cover_image,
        (
          SELECT COALESCE(
            jsonb_agg(
              build_link_json(l)
              ORDER BY array_position(s.social_link_ids, l.id)
            ),
            '[]'::jsonb
          )
          FROM links l
          WHERE l.id = ANY(s.social_link_ids)
        ) AS social_links
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

/** Whether the site_settings row has been created yet (first-run setup). */
export async function hasSiteSettings(): Promise<boolean> {
  try {
    const rows = await sql`
      SELECT EXISTS(SELECT 1 FROM site_settings) AS exists
    `
    return Boolean(rows[0]?.exists)
  } catch (cause) {
    throw new Error('Failed to check site settings.', { cause })
  }
}
