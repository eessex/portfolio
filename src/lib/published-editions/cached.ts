'use cache'

import { cacheTag } from 'next/cache'

import { fetchPublishedEditionsRaw } from '@/lib/published-editions/data'

export async function fetchCachedPublishedEditionsFirstPage() {
  cacheTag('published-editions')

  return await fetchPublishedEditionsRaw()
}
