'use cache'

import { cacheTag } from 'next/cache'

import { fetchSiteSettings } from '@/lib/site-settings/data'

export async function fetchCachedSiteSettings() {
  cacheTag('settings')

  return await fetchSiteSettings()
}
