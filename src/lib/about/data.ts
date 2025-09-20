import { sql } from '@vercel/postgres'

import { aboutClientSchema } from '@/lib/about/schemas'
import type { AboutClient } from '@/lib/about/types'
import { formatDbResponseForClient } from '@/ui/util'

export async function fetchAboutPage () {
  try {
    const data = await sql<AboutClient>`
      SELECT
        a.*,
        build_image_json(i) AS cover_image
      FROM about a
      LEFT JOIN images i ON a.cover_image_id = i.id
    `
    if (data.rowCount === 0) {
      return
    }
    return formatDbResponseForClient(data.rows[0], aboutClientSchema)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch about page data.')
  }
}
