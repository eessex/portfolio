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
  cacheTag(`events:${isAuthed ? 'authed' : 'public'}`)

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

  const event = await fetchEventById(id, isAuthed)
  // embeds its project
  if (event?.projectId) cacheTag(`project:${event.projectId}`)
  return event
}
