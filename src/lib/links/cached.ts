'use cache'

import { cacheTag } from 'next/cache'

import { sql } from '@/lib/db'
import { fetchLinksRaw } from '@/lib/links/data'
import { linkSchema } from '@/lib/links/schemas'
import { formatDbResponseForClient } from '@/lib/util'

export async function fetchCachedLinksFirstPage() {
  cacheTag('links')

  return await fetchLinksRaw()
}

/** Only the press links */
export async function fetchPressLinks() {
  cacheTag('links')
  cacheTag('links:press')

  try {
    const data = await sql`
      SELECT * FROM links
      WHERE type = 'press'
      ORDER BY publish_date DESC, created_at DESC
    `
    return data.map((row) =>
      formatDbResponseForClient(row, linkSchema)
    )
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch press links.')
  }
}

/** links to social media profiles */
export async function fetchSocialLinks() {
  cacheTag('links')
  cacheTag('links:social')

  try {
    const data = await sql`
      SELECT * FROM links
      WHERE type = 'social'
      AND title IS NOT NULL
      ORDER BY title ASC
    `
    return data.map((row) =>
      formatDbResponseForClient(row, linkSchema)
    )
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch social links.')
  }
}
