import { aboutClientSchema } from '@/lib/about/schemas'
import { sql } from '@/lib/db'
import { formatDbResponseForClient } from '@/lib/util'

export async function fetchAboutPage() {
  try {
    const data = await sql`
      SELECT
        a.*,
        (
          CASE
            WHEN a.cover_image_id IS NOT NULL
            THEN (
              SELECT build_image_json(i)
              FROM images i
              WHERE i.id = a.cover_image_id
            )
          END
        ) AS cover_image
      FROM about a
    `
    if (data.length === 0) {
      return
    }
    return formatDbResponseForClient(data[0], aboutClientSchema)
  } catch (cause) {
    throw new Error('Failed to fetch about page data.', { cause })
  }
}
