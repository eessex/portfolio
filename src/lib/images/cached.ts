'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchImagesRaw,
  fetchPressImagesRaw
} from '@/lib/images/data'

export async function fetchCachedImagesFirstPage() {
  cacheTag('images')

  return await fetchImagesRaw()
}

/** Only the press photos */
export async function fetchCachedPressImages() {
  cacheTag('images')
  cacheTag('images:press')

  return await fetchPressImagesRaw()
}
