'use cache'

import { cacheTag } from 'next/cache'

import { fetchEmbedCodesRaw } from '@/lib/embed-codes/data'

export async function fetchCachedEmbedCodesFirstPage() {
  cacheTag('embed-codes')

  return await fetchEmbedCodesRaw()
}
