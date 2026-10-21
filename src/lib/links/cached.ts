'use cache'

import { cacheTag } from 'next/cache'

import { fetchLinksRaw } from '@/lib/links/data'

export async function fetchCachedLinksFirstPage(isPress?: boolean) {
  cacheTag('links')

  return await fetchLinksRaw(undefined, undefined, isPress)
}
