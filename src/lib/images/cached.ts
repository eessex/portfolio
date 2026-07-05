'use cache'

import { cacheTag } from 'next/cache'

import { sql } from '@/lib/db'
import { fetchImagesRaw } from '@/lib/images/data'
import { imageSchema } from '@/lib/images/schemas/db'
import { formatDbResponseForClient } from '@/lib/util'

export async function fetchCachedImagesFirstPage() {
  cacheTag('images')

  return await fetchImagesRaw()
}

/** Only the press photos */
export async function fetchPressImages() {
  cacheTag('images')
  cacheTag('images:press')

  try {
    const data = await sql`
      SELECT * FROM images
      WHERE is_press = true
    `
    return data.map((row) =>
      formatDbResponseForClient(row, imageSchema)
    )
  } catch (cause) {
    throw new Error('Failed to fetch press images.', { cause })
  }
}
