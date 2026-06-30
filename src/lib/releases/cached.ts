'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchReleaseBySlug,
  fetchReleasesRaw
} from '@/lib/releases/data'

export async function fetchCachedReleasesFirstPage(
  isAuthed: boolean,
  projectId?: string
) {
  cacheTag('releases')

  if (isAuthed) {
    cacheTag('releases:authed')
  } else {
    cacheTag('releases:public')
  }

  if (projectId) {
    cacheTag(`project:${projectId}:releases`)
  }

  return await fetchReleasesRaw(
    isAuthed,
    projectId,
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
