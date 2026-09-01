'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { fetchEventById } from '@/lib/events/data'
import { createEventSchema, eventSchema } from '@/lib/events/schemas'
import type { CreateEvent, Event } from '@/lib/events/types'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { generateUniqueSlug } from '@/lib/slug/data'
import { formatDbResponseForClient } from '@/lib/util'
import { resolveVenueId } from '@/lib/venues/actions'

async function prepareEventData(
  data: Record<string, unknown>,
  id?: string
) {
  const { coverImageId, imageIds } =
    await resolveOrderedImageIds(data)
  const { linkIds } = await resolveOrderedLinkIds(data)
  const { embedCodeIds } = await resolveOrderedEmbedCodeIds(data)
  const venueId = await resolveVenueId(data)

  return {
    ...data,
    coverImageId,
    embedCodeIds,
    imageIds,
    linkIds,
    venueId,
    path: 'events',
    slug: await generateUniqueSlug(
      String(data.title || ''),
      'events',
      id
    )
  }
}

export async function editEvent(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createEventSchema,
    itemType: 'events',
    prepare: async (data) => await prepareEventData(data, id),
    invalidate: (saved?: Event) =>
      invalidateEventTags(saved?.id ?? id),
    save: (event) =>
      id ? updateEvent(event, id) : createEvent(event)
  })
}

function invalidateEventTags(id?: string) {
  updateTag('events')
  updateTag('events:authed')
  updateTag('events:public')
  if (id) updateTag(`event:${id}`)
  updateTag('venues')
  updateTag('images')
  updateTag('links')
  updateTag('embed-codes')
}

export async function deleteEvent(event: Event) {
  return runDeleteAction<Event>({
    itemType: 'events',
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
      { ...row, path: 'events' },
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
      { ...row, path: 'events' },
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
