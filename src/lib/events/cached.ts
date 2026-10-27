import { cacheTag } from 'next/cache'

import {
  fetchEventById,
  fetchEventsRaw,
  fetchUpcomingEventsRaw
} from '@/lib/events/data'

/** The first page is cached; later pages and searches aren't. */
export async function fetchEvents(
  isAuthed = false,
  projectId?: string,
  cursor?: string,
  query?: string
) {
  if (!cursor && !query) {
    return fetchCachedEventsFirstPage(isAuthed, projectId)
  }

  return fetchEventsRaw(isAuthed, projectId, cursor, query)
}

export async function fetchCachedEventsFirstPage(
  isAuthed: boolean,
  projectId?: string
) {
  'use cache'
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
  'use cache'
  cacheTag('events')
  return fetchUpcomingEventsRaw(isAuthed)
}

export async function fetchCachedEventById(
  id: string,
  isAuthed: boolean = false
) {
  'use cache'
  cacheTag('events')
  cacheTag(`event:${id}`)

  const event = await fetchEventById(id, isAuthed)
  // embeds its project
  if (event?.projectId) cacheTag(`project:${event.projectId}`)
  return event
}
