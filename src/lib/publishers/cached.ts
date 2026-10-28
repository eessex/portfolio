import { cacheTag } from 'next/cache'

import { fetchPublishersRaw } from '@/lib/publishers/data'

/**
 * dashboard: fetch all the publishers. The first page is cached;
 * later pages and searches aren't.
 */
export async function fetchPublishers(
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedPublishersFirstPage()
  }

  return fetchPublishersRaw(cursor, query)
}

export async function fetchCachedPublishersFirstPage() {
  'use cache'
  cacheTag('publishers')

  return await fetchPublishersRaw()
}
