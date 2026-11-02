import { cacheTag } from 'next/cache'

import { fetchSiteIdentitySource } from '@/lib/projects/data'
import {
  type SiteKind,
  siteKindForType,
  siteProfile
} from '@/lib/projects/site-profile'
import { fetchPublisherById } from '@/lib/publishers/data'
import type { Publisher } from '@/lib/publishers/schemas/db'

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

/**
 * The house publisher where the site's profile uses one (label sites):
 * new editions start on it and release lists leave its name out.
 * Undefined on artist sites.
 */
export async function activeHousePublisherId() {
  const { kind, housePublisherId } = await siteIdentity()
  return siteProfile(kind).isHousePublisherUsed
    ? housePublisherId
    : undefined
}

/**
 * The active house publisher itself, for the release form's new
 * editions to start on. Uncached, like the form's other reads; a read
 * error logs and leaves new editions blank rather than failing the
 * form.
 */
export async function fetchActiveHousePublisher(): Promise<
  Publisher | undefined
> {
  try {
    const id = await activeHousePublisherId()
    const publisher = id ? await fetchPublisherById(id) : null
    if (!publisher) return undefined
    const { releaseSlugs: _releaseSlugs, ...rest } = publisher
    return rest
  } catch (err) {
    console.error('Failed to read the house publisher:', err)
    return undefined
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
