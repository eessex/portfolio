'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchProjectBySlug,
  fetchProjectsRaw
} from '@/lib/projects/data'

export async function fetchCachedProjectsFirstPage(
  isAuthed: boolean
) {
  cacheTag('projects')

  if (isAuthed) {
    cacheTag('projects:authed')
  } else {
    cacheTag('projects:public')
  }

  return await fetchProjectsRaw(isAuthed, undefined, undefined)
}

export async function fetchCachedProjectBySlug(
  slug: string,
  isAuthed: boolean = false
) {
  cacheTag(`projects:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`project:${slug}`)

  return fetchProjectBySlug(slug, isAuthed)
}
