'use cache'

import { cacheTag } from 'next/cache'

import { fetchAboutPage } from '@/lib/about/data'

export async function fetchCachedAboutPage() {
  cacheTag('about')

  return await fetchAboutPage()
}
