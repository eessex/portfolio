'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchReleaseById,
  fetchReleasesRaw
} from '@/lib/releases/data'

export async function fetchCachedReleasesFirstPage(
  isAuthed: boolean,
  projectId?: string
) {
  cacheTag('releases')
  cacheTag(`releases:${isAuthed ? 'authed' : 'public'}`)

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

export async function fetchCachedReleaseById(
  id: string,
  isAuthed: boolean = false
) {
  cacheTag(`releases:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`release:${id}`)

  return fetchReleaseById(id, isAuthed)
}
