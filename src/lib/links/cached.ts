'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchLinksRaw,
  fetchPressLinksRaw,
  fetchSocialLinksRaw
} from '@/lib/links/data'

export async function fetchCachedLinksFirstPage(isPress?: boolean) {
  cacheTag('links')

  return await fetchLinksRaw(undefined, undefined, isPress)
}

/** Only the press links */
export async function fetchCachedPressLinks() {
  cacheTag('links')
  cacheTag('links:press')

  return await fetchPressLinksRaw()
}

/** links to social media profiles */
export async function fetchCachedSocialLinks() {
  cacheTag('links')
  cacheTag('links:social')

  return await fetchSocialLinksRaw()
}
