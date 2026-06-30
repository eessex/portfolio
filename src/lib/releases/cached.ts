'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchReleaseBySlug,
  fetchReleasesRaw
} from '@/lib/releases/data'

export async function fetchCachedReleasesFirstPage(
  isAuthed: boolean,
  projectSlug?: string
) {
  cacheTag('releases')

  if (isAuthed) {
    cacheTag('releases:authed')
  } else {
    cacheTag('releases:public')
  }

  if (projectSlug) {
    cacheTag(`project:${projectSlug}:releases`)
  }

  return await fetchReleasesRaw(
    isAuthed,
    undefined,
    projectSlug,
    undefined,
    undefined
  )
}

export async function fetchCachedReleaseBySlug(
  slug: string,
  isAuthed: boolean = false
) {
  cacheTag(`releases:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`release:${slug}`)

  return fetchReleaseBySlug(slug, isAuthed)
}
