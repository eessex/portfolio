'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchEventById,
  fetchEventsRaw,
  fetchUpcomingEventsRaw
} from '@/lib/events/data'

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

export async function fetchCachedUpcomingEvents(
  isAuthed: boolean = false
) {
  cacheTag('events')
  cacheTag(`events:${isAuthed ? 'authed' : 'public'}`)
  return fetchUpcomingEventsRaw(isAuthed)
}

export async function fetchCachedEventById(
  id: string,
  isAuthed: boolean = false
) {
  cacheTag(`events:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`event:${id}`)

  return fetchEventById(id, isAuthed)
}
