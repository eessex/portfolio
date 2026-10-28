import { cacheTag } from 'next/cache'

import { fetchEmbedCodesRaw } from '@/lib/embed-codes/data'

/** The first page is cached; later pages and searches aren't. */
export async function fetchEmbedCodes(
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedEmbedCodesFirstPage()
  }

  return fetchEmbedCodesRaw(cursor, query)
}

export async function fetchCachedEmbedCodesFirstPage() {
  'use cache'
  cacheTag('embed-codes')

  return await fetchEmbedCodesRaw()
}
