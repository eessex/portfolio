import { cacheTag } from 'next/cache'

import {
  type FetchImagesOptions,
  fetchImagesRaw
} from '@/lib/images/data'

/**
 * The first page of all images, or of press images, is cached;
 * later pages, searches and other types aren't.
 */
export async function fetchImages(
  cursor?: string,
  query?: string,
  type?: string,
  { isSvgExcluded = false }: FetchImagesOptions = {}
) {
  if (!cursor && !query) {
    if (type === 'press') {
      return fetchCachedPressImagesFirstPage(isSvgExcluded)
    }
    if (!type) return fetchCachedImagesFirstPage(isSvgExcluded)
  }

  return fetchImagesRaw(cursor, query, type, { isSvgExcluded })
}

export async function fetchCachedImagesFirstPage(
  isSvgExcluded = false
) {
  'use cache'
  cacheTag('images')

  return await fetchImagesRaw(undefined, undefined, undefined, {
    isSvgExcluded
  })
}

/** Only the press photos */
export async function fetchCachedPressImagesFirstPage(
  isSvgExcluded = false
) {
  'use cache'
  cacheTag('images')

  return await fetchImagesRaw(undefined, undefined, 'press', {
    isSvgExcluded
  })
}
