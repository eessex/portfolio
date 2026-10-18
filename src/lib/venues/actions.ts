'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  resolveItemId,
  runDeleteAction,
  runFormAction,
  saveItemFromFields
} from '@/lib/form-action'
import { itemIdFieldName } from '@/lib/item-fields'
import { formatDbResponseForClient } from '@/lib/util'
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

/**
 * Creates or updates from raw (unnormalized) field data,
 * ie an entry pulled out of another domain's form submission.
 */
export async function saveVenueFromFields(
  fields: Record<string, unknown>,
  id?: string
): Promise<Venue> {
  return saveItemFromFields({
    id,
    fields,
    schema: createVenueSchema,
    itemType: 'venues',
    create: createVenue,
    update: updateVenue
  })
}

export async function resolveVenueId(
  data: Record<string, unknown>,
  idField = itemIdFieldName('venues')
): Promise<string | undefined> {
  return resolveItemId(data, idField, saveVenueFromFields)
}

export async function deleteVenue(venue: Venue) {
  return runDeleteAction<Venue>({
    itemType: 'venues',
    invalidate: invalidateVenueTags,
    del: async () => {
      // the events FK would refuse it anyway, with a raw DB message
      const rows = await sql`
        SELECT COUNT(*)::int AS count FROM events
        WHERE venue_id = ${venue.id}
      `
      const count = rows[0]?.count ?? 0
      if (count > 0) {
        return {
          ok: false,
          message: `This venue is used by ${count} ${count === 1 ? 'event' : 'events'}; move them to another venue first.`
        }
      }
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
