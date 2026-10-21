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
  cacheTag('releases')
  cacheTag(`release:${id}`)

  const release = await fetchReleaseById(id, isAuthed)
  // embeds its project (and its name as a fallback artist)
  if (release?.projectId) cacheTag(`project:${release.projectId}`)
  return release
}
