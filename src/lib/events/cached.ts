'use cache'

import { cacheTag } from 'next/cache'

import { fetchEventBySlug, fetchEventsRaw } from '@/lib/events/data'

export async function fetchCachedEventsFirstPage(
  isAuthed: boolean,
  projectSlug?: string
) {
  cacheTag('events')

  if (isAuthed) {
    cacheTag('events:authed')
  } else {
    cacheTag('events:public')
  }

  if (projectSlug) {
    cacheTag(`project:${projectSlug}:events`)
  }

  return await fetchEventsRaw(
    isAuthed,
    projectSlug,
    undefined,
    undefined
  )
}

export async function fetchCachedEventBySlug(
  slug: string,
  isAuthed: boolean = false
) {
  cacheTag(`events:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`event:${slug}`)

  return fetchEventBySlug(slug, isAuthed)
}
