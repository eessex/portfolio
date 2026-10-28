import { cacheTag } from 'next/cache'

import { fetchVenuesRaw } from '@/lib/venues/data'

/** The first page is cached; later pages and searches aren't. */
export async function fetchVenues(cursor?: string, query?: string) {
  if (!cursor && !query) {
    return fetchCachedVenuesFirstPage()
  }

  return fetchVenuesRaw(cursor, query)
}

export async function fetchCachedVenuesFirstPage() {
  'use cache'
  cacheTag('venues')

  return await fetchVenuesRaw()
}
