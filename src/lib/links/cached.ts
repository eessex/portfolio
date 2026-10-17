'use cache'

import { cacheTag } from 'next/cache'

import { fetchLinksRaw, fetchSocialLinksRaw } from '@/lib/links/data'

export async function fetchCachedLinksFirstPage(isPress?: boolean) {
  cacheTag('links')

  return await fetchLinksRaw(undefined, undefined, isPress)
}

/** links to social media profiles */
export async function fetchCachedSocialLinks() {
  cacheTag('links')
  cacheTag('links:social')

  return await fetchSocialLinksRaw()
}
