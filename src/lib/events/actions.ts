'use server'

import { updateTag } from 'next/cache'

import {
  DEFAULT_TIME_ZONE,
  fromDateTimeInputValue
} from '@/lib/dates'
import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { fetchEventById } from '@/lib/events/data'
import { createEventSchema, eventSchema } from '@/lib/events/schemas'
import type { CreateEvent, Event } from '@/lib/events/types'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { PagePaths } from '@/lib/schemas'
import { generateUniqueSlug } from '@/lib/slug/data'
import { slugCacheTag } from '@/lib/slug/util'
import { formatDbResponseForClient } from '@/lib/util'
import { resolveVenueId } from '@/lib/venues/actions'
import { fetchVenueById } from '@/lib/venues/data'

async function prepareEventData(
  data: Record<string, unknown>,
  id?: string
) {
  const [
    { coverImageId, imageIds },
    { linkIds },
    { embedCodeIds },
    venueId,
    slug
  ] = await Promise.all([
    resolveOrderedImageIds(data),
    resolveOrderedLinkIds(data),
    resolveOrderedEmbedCodeIds(data),
    resolveVenueId(data),
    generateUniqueSlug(String(data.title || ''), PagePaths.events, id)
  ])
  const timeZone = await resolveVenueTimeZone(venueId)

  return {
    ...data,
    coverImageId,
    embedCodeIds,
    imageIds,
    linkIds,
    venueId,
    startTime: toEventInstant(data.startTime, timeZone),
    endTime: toEventInstant(data.endTime, timeZone),
    path: PagePaths.events,
    slug
  }
}

async function resolveVenueTimeZone(venueId?: string) {
  if (!venueId) return DEFAULT_TIME_ZONE
  const venue = await fetchVenueById(venueId)
  return venue?.timezone ?? DEFAULT_TIME_ZONE
}

function toEventInstant(value: unknown, timeZone: string) {
  return typeof value === 'string' && value
    ? fromDateTimeInputValue(value, timeZone)
    : value
}

export async function editEvent(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createEventSchema,
    itemType: PagePaths.events,
    prepare: async (data) => await prepareEventData(data, id),
    invalidate: (saved?: Event) =>
      invalidateEventTags(saved?.id ?? id),
    save: (event) =>
      id ? updateEvent(event, id) : createEvent(event)
  })
}

function invalidateEventTags(id?: string) {
  updateTag('events')
  updateTag(slugCacheTag(PagePaths.events))
  if (id) updateTag(`event:${id}`)
  updateTag('venues')
  updateTag('images')
  updateTag('links')
  updateTag('embed-codes')
}

export async function deleteEvent(event: Event) {
  return runDeleteAction<Event>({
    itemType: PagePaths.events,
    invalidate: () => invalidateEventTags(event.id),
    del: async () => {
      await sql`
        DELETE FROM events
        WHERE id = ${event.id}
      `
    }
  })
}

async function createEvent(event: CreateEvent) {
  try {
    const {
      coverImageId,
      description,
      embedCodeIds,
      endTime,
      imageIds,
      isPublished,
      linkIds,
      projectId,
      shortDescription,
      slug,
      startTime,
      tagIds,
      ticketLink,
      title,
      venueId
    } = toDbRow(event)
    const rows = await sql`
      INSERT INTO events (
        cover_image_id,
        description,
        embed_code_ids,
        end_time,
        image_ids,
        is_published,
        link_ids,
        project_id,
        short_description,
        slug,
        start_time,
        tag_ids,
        ticket_link,
        title,
        venue_id,
        created_at
      ) VALUES (
        ${coverImageId},
        ${description},
        ${embedCodeIds},
        ${endTime},
        ${imageIds},
        ${isPublished},
        ${linkIds},
        ${projectId},
        ${shortDescription},
        ${slug},
        ${startTime},
        ${tagIds},
        ${ticketLink},
        ${title},
        ${venueId},
        current_timestamp
      )
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to create event.')
    return formatDbResponseForClient(
      { ...row, path: PagePaths.events },
      eventSchema
    )
  } catch (cause) {
    throw new Error('Failed to create event.', { cause })
  }
}

async function updateEvent(event: CreateEvent, id: string) {
  const existingEvent = await fetchEventById(id, true)
  try {
    const {
      coverImageId,
      description,
      embedCodeIds,
      endTime,
      imageIds,
      isPublished,
      linkIds,
      projectId,
      shortDescription,
      slug,
      startTime,
      tagIds,
      ticketLink,
      title,
      venueId
    } = toDbRow(event, existingEvent)
    const rows = await sql`
      UPDATE events
      SET
        cover_image_id = ${coverImageId},
        description = ${description},
        embed_code_ids = ${embedCodeIds},
        end_time = ${endTime},
        image_ids = ${imageIds},
        is_published = ${isPublished},
        link_ids = ${linkIds},
        project_id = ${projectId},
        short_description = ${shortDescription},
        slug = ${slug},
        start_time = ${startTime},
        tag_ids = ${tagIds},
        ticket_link = ${ticketLink},
        title = ${title},
        venue_id = ${venueId},
        updated_at = current_timestamp
      WHERE id = ${id}
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to update event.')
    return formatDbResponseForClient(
      { ...row, path: PagePaths.events },
      eventSchema
    )
  } catch (cause) {
    throw new Error('Failed to update event.', { cause })
  }
}

function toDbRow(event: CreateEvent, existing?: Partial<Event>) {
  const eventToSave = {
    ...existing,
    ...event
  }

  return {
    coverImageId: eventToSave.coverImageId ?? null,
    description: eventToSave.description ?? null,
    embedCodeIds: eventToSave.embedCodeIds ?? null,
    endTime: eventToSave.endTime ?? null,
    imageIds: eventToSave.imageIds ?? null,
    isPublished: eventToSave.isPublished ?? null,
    linkIds: eventToSave.linkIds ?? null,
    projectId: eventToSave.projectId ?? null,
    shortDescription: eventToSave.shortDescription ?? null,
    slug: eventToSave.slug,
    startTime: eventToSave.startTime,
    tagIds: eventToSave.tagIds ?? null,
    ticketLink: eventToSave.ticketLink ?? null,
    title: eventToSave.title,
    venueId: eventToSave.venueId
  }
}
