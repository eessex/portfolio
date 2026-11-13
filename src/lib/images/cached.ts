import { cacheLife, cacheTag } from 'next/cache'

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

// inlined into every page's HTML and RSC payload, so a big file
// stays a URL
export const MAX_INLINE_SVG_BYTES = 32_000

/**
 * An uploaded SVG as a `data:` URL, for a CSS mask: no cross-origin
 * request, so it works whatever CORS the storage host sends. Stored
 * files never change, so the URL alone keys it. Throws (uncached) on
 * a failed fetch; `undefined` when too big to inline.
 */
export async function fetchCachedSvgDataUrl(url: string) {
  'use cache'
  cacheLife('max')
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch SVG (${res.status}): ${url}`)
  }
  const bytes = Buffer.from(await res.arrayBuffer())
  if (bytes.length > MAX_INLINE_SVG_BYTES) return undefined
  return `data:image/svg+xml;base64,${bytes.toString('base64')}`
}
