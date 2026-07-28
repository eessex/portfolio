'use cache'

import { cacheTag } from 'next/cache'

import { fetchPublishersRaw } from '@/lib/publishers/data'

export async function fetchCachedPublishersFirstPage() {
  cacheTag('publishers')

  return await fetchPublishersRaw()
}
