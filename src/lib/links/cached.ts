import { cacheTag } from 'next/cache'

import { fetchLinksRaw } from '@/lib/links/data'

/**
 * `isPress` restricts results to press links (`true`) or to every
 * other link (`false`), for the separate Press/Links pickers. The
 * first page is cached; later pages and searches aren't.
 */
export async function fetchLinks(
  cursor?: string,
  query?: string,
  isPress?: boolean
) {
  if (!cursor && !query) {
    return fetchCachedLinksFirstPage(isPress)
  }

  return fetchLinksRaw(cursor, query, isPress)
}

export async function fetchCachedLinksFirstPage(isPress?: boolean) {
  'use cache'
  cacheTag('links')

  return await fetchLinksRaw(undefined, undefined, isPress)
}
