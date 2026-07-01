'use cache'

import { cacheTag } from 'next/cache'

import { fetchEventById, fetchEventsRaw } from '@/lib/events/data'
import { resolveSlug } from '@/lib/slug/data'

export async function fetchCachedEventsFirstPage(
  isAuthed: boolean,
  projectId?: string
) {
  cacheTag('events')

  if (isAuthed) {
    cacheTag('events:authed')
  } else {
    cacheTag('events:public')
  }

  if (projectId) {
    cacheTag(`project:${projectId}:events`)
  }

  return await fetchEventsRaw(
    isAuthed,
    projectId,
    undefined,
    undefined
  )
}

export async function fetchCachedEventBySlug(
  slug: string,
  isAuthed: boolean = false
) {
  const resolved = await resolveSlug('events', slug)
  if (!resolved) return undefined

  cacheTag(`events:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`event:${resolved.id}`)

  return fetchEventById(resolved.id, isAuthed)
}

export async function fetchCachedEventById(
  id: string,
  isAuthed: boolean = false
) {
  cacheTag(`events:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`event:${id}`)

  return fetchEventById(id, isAuthed)
}
