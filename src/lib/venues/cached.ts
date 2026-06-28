'use cache'

import { cacheTag } from 'next/cache'

import { fetchVenuesRaw } from '@/lib/venues/data'

export async function fetchCachedVenuesFirstPage() {
  cacheTag('venues')

  return await fetchVenuesRaw()
}
