'use cache'

import { cacheTag } from 'next/cache'

import { fetchSiteSettings } from '@/lib/site-settings/data'

export async function fetchCachedSiteSettings() {
  cacheTag('settings')
  // embeds the footer's links, which other forms edit inline
  cacheTag('links')

  return await fetchSiteSettings()
}
