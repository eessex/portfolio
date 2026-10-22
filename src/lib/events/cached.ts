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
  return fetchUpcomingEventsRaw(isAuthed)
}

export async function fetchCachedEventById(
  id: string,
  isAuthed: boolean = false
) {
  cacheTag('events')
  cacheTag(`event:${id}`)

  const event = await fetchEventById(id, isAuthed)
  // embeds its project
  if (event?.projectId) cacheTag(`project:${event.projectId}`)
  return event
}
