import { cacheTag } from 'next/cache'

import { fetchSiteIdentitySource } from '@/lib/projects/data'
import {
  type SiteKind,
  siteKindForType
} from '@/lib/projects/site-profile'

export interface SiteIdentity {
  kind: SiteKind
  /**
   * The publisher the site releases as: the default project's own
   * publisher, else the built-in Self-released one. Undefined only
   * when neither could be read.
   */
  housePublisherId?: string
}

/**
 * Answers "who is this site?" for everything label-specific. Reads the
 * default project whether or not it's published: the site's kind
 * doesn't depend on who's viewing. A read error logs and falls back to
 * a `music` site (outside the cache, so the fallback isn't cached).
 */
export async function siteIdentity(): Promise<SiteIdentity> {
  try {
    return await fetchCachedSiteIdentity()
  } catch (err) {
    console.error('Failed to read the site identity:', err)
    return { kind: 'music' }
  }
}

async function fetchCachedSiteIdentity(): Promise<SiteIdentity> {
  'use cache'
  // project saves and publisher saves/deletes both update it
  cacheTag('projects')

  const { type, publisherId, builtInPublisherId } =
    await fetchSiteIdentitySource()
  return {
    kind: siteKindForType(type),
    housePublisherId: publisherId ?? builtInPublisherId
  }
}
