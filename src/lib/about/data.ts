'use cache'

import { cacheTag } from 'next/cache'

import { aboutClientSchema } from '@/lib/about/schemas'
import { sql } from '@/lib/db'
import { formatDbResponseForClient } from '@/lib/util'

export async function fetchAboutPage() {
  cacheTag('about')

  try {
    const data = await sql`
      SELECT
        a.*,
        build_image_json(i) AS cover_image
      FROM about a
      LEFT JOIN images i ON a.cover_image_id = i.id
    `
    if (data.length === 0) {
      return
    }
    return formatDbResponseForClient(data[0], aboutClientSchema)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch about page data.')
  }
}
