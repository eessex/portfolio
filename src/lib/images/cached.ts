'use cache'

import { cacheTag } from 'next/cache'

import { fetchImagesRaw } from '@/lib/images/data'

export async function fetchCachedImagesFirstPage() {
  cacheTag('images')

  return await fetchImagesRaw()
}

/** Only the press photos */
export async function fetchCachedPressImagesFirstPage() {
  cacheTag('images')

  return await fetchImagesRaw(undefined, undefined, 'press')
}
