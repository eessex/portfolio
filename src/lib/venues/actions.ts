'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import {
  formatDbResponseForClient,
  normalizeFormData
} from '@/lib/util'
import { fetchVenueById } from '@/lib/venues/data'
import {
  type CreateVenue,
  createVenueSchema,
  type Venue,
  venueSchema
} from '@/lib/venues/schemas/db'

export async function editVenue(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createVenueSchema,
    itemType: 'venues',
    invalidate: invalidateVenueTags,
    save: (venue) =>
      id ? updateVenue(venue, id) : createVenue(venue)
  })
}

/**
 * Venues are embedded directly into their events' cached fetches via
 * build_venue_json, so saving/deleting one must invalidate the events cache
 * too, not just the venues list.
 */
function invalidateVenueTags() {
  updateTag('venues')
  updateTag('events')
}

export async function createVenueFromFields(
  fields: Record<string, unknown>
): Promise<Venue> {
  const parsed = createVenueSchema.safeParse(
    normalizeFormData(fields)
  )
  if (!parsed.success) {
    throw new Error(
      `Invalid venue data: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(', ')}`
    )
  }
  return createVenue(parsed.data)
}

export async function resolveVenueId(
  data: Record<string, unknown>
): Promise<string | undefined> {
  if (typeof data.venueId === 'string' && data.venueId) {
    return data.venueId
  }

  const fields = {
    name: data.name,
    address: data.address,
    city: data.city,
    country: data.country,
    state: data.state,
    timezone: data.timezone,
    url: data.url
  }
  delete data.name
  delete data.address
  delete data.city
  delete data.country
  delete data.state
  delete data.timezone
  delete data.url

  if (
    typeof fields.city !== 'string' ||
    !fields.city ||
    typeof fields.timezone !== 'string' ||
    !fields.timezone
  ) {
    return undefined
  }

  const venue = await createVenueFromFields(fields)
  return venue.id
}

export async function deleteVenue(venue: Venue) {
  return runDeleteAction<Venue>({
    itemType: 'venues',
    invalidate: invalidateVenueTags,
    del: async () => {
      await sql`
        DELETE FROM venues
        WHERE id = ${venue.id}
      `
    }
  })
}

async function createVenue(venue: CreateVenue) {
  try {
    const {
      address,
      city,
      country,
      name,
      primaryVenueId,
      state,
      timezone,
      url
    } = toDbRow(venue)
    const rows = await sql`
      INSERT INTO venues (
        address,
        city,
        country,
        name,
        primary_venue_id,
        state,
        timezone,
        url,
        created_at
      ) VALUES (
        ${address},
        ${city},
        ${country},
        ${name},
        ${primaryVenueId},
        ${state},
        ${timezone},
        ${url},
        current_timestamp
      )
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to create venue.')
    return formatDbResponseForClient(row, venueSchema)
  } catch (cause) {
    throw new Error('Failed to create venue.', { cause })
  }
}

async function updateVenue(venue: CreateVenue, id: string) {
  const existingVenue = await fetchVenueById(id)
  try {
    const {
      address,
      city,
      country,
      name,
      primaryVenueId,
      state,
      timezone,
      url
    } = toDbRow(venue, existingVenue ?? undefined)
    const rows = await sql`
      UPDATE venues
      SET
        address = ${address},
        city = ${city},
        country = ${country},
        name = ${name},
        primary_venue_id = ${primaryVenueId},
        state = ${state},
        timezone = ${timezone},
        updated_at = current_timestamp,
        url = ${url}
      WHERE id = ${id}
      RETURNING *
    `

    const row = rows[0]
    if (!row) throw new Error('Failed to update venue.')
    return formatDbResponseForClient(row, venueSchema)
  } catch (cause) {
    throw new Error('Failed to update venue.', { cause })
  }
}

function toDbRow(venue: CreateVenue, existing?: Venue) {
  const venueToSave = {
    ...existing,
    ...venue
  }

  return {
    address: venueToSave.address ?? null,
    city: venueToSave.city,
    country: venueToSave.country ?? null,
    name: venueToSave.name ?? null,
    primaryVenueId: venueToSave.primaryVenueId ?? null,
    state: venueToSave.state ?? null,
    timezone: venueToSave.timezone,
    url: venueToSave.url ?? null
  }
}
