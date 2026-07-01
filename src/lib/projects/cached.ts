'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchProjectById,
  fetchProjectsRaw
} from '@/lib/projects/data'
import { resolveSlug } from '@/lib/slug/data'

export async function fetchCachedProjectsFirstPage(
  isAuthed: boolean
) {
  cacheTag('projects')
  cacheTag(`projects:${isAuthed ? 'authed' : 'public'}`)

  return await fetchProjectsRaw(isAuthed, undefined, undefined)
}

export async function fetchCachedProjectBySlug(
  slug: string,
  isAuthed: boolean = false
) {
  const resolved = await resolveSlug('projects', slug)
  if (!resolved) return undefined

  cacheTag(`projects:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`project:${slug}`)

  return fetchProjectById(resolved.id, isAuthed)
}

export async function fetchCachedProjectById(
  id: string,
  isAuthed: boolean = false
) {
  cacheTag(`projects:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`project:${id}`)

  return fetchProjectById(id, isAuthed)
}
