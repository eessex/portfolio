import { cacheTag } from 'next/cache'

import {
  fetchReleaseById,
  fetchReleasesRaw
} from '@/lib/releases/data'

/** The first page is cached; later pages and searches aren't. */
export async function fetchReleases(
  isAuthed = false,
  projectId?: string,
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedReleasesFirstPage(isAuthed, projectId)
  }

  return fetchReleasesRaw(isAuthed, projectId, cursor, query)
}

export async function fetchCachedReleasesFirstPage(
  isAuthed: boolean,
  projectId?: string
) {
  'use cache'
  cacheTag('releases')

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
  'use cache'
  cacheTag('releases')
  cacheTag(`release:${id}`)

  const release = await fetchReleaseById(id, isAuthed)
  // embeds its project (and its name as a fallback artist)
  if (release?.projectId) cacheTag(`project:${release.projectId}`)
  return release
}
