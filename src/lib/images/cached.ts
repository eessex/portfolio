import { cacheTag } from 'next/cache'

import { fetchImagesRaw } from '@/lib/images/data'

/**
 * The first page of all images, or of press images, is cached;
 * later pages, searches and other types aren't.
 */
export async function fetchImages(
  cursor?: string,
  query?: string,
  type?: string
) {
  if (!cursor && !query) {
    if (type === 'press') return fetchCachedPressImagesFirstPage()
    if (!type) return fetchCachedImagesFirstPage()
  }

  return fetchImagesRaw(cursor, query, type)
}

export async function fetchCachedImagesFirstPage() {
  'use cache'
  cacheTag('images')

  return await fetchImagesRaw()
}

/** Only the press photos */
export async function fetchCachedPressImagesFirstPage() {
  'use cache'
  cacheTag('images')

  return await fetchImagesRaw(undefined, undefined, 'press')
}
