'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import type { FormResponse } from '@/lib/types'
import {
  formatDbResponseForClient,
  formatErrorResponse,
  formatValidationResponse,
  normalizeFormData
} from '@/lib/util'
import { fetchVenueById } from '@/lib/venues/data'
import {
  type CreateVenue,
  createVenueSchema,
  type Venue,
  venueSchema
} from '@/lib/venues/schemas/db'

export async function editVenue(
  formData: FormData,
  id?: string
): Promise<FormResponse<Venue>> {
  const data = normalizeFormData(Object.fromEntries(formData))

  const validatedVenue = createVenueSchema.safeParse(data)

  if (!validatedVenue.success) {
    return formatValidationResponse(
      validatedVenue.error,
      'Failed to validate venue.'
    )
  }

  try {
    let savedVenue: Venue | undefined
    if (id) {
      savedVenue = await updateVenue(validatedVenue.data, id)
    } else {
      savedVenue = await createVenue(validatedVenue.data)
    }
    if (savedVenue) {
      updateTag('venues')
      return {
        ok: true,
        res: savedVenue
      }
    }
  } catch (err) {
    return formatErrorResponse('Failed to edit venue', err)
  }
}

export async function deleteVenue(
  venue: Venue
): Promise<FormResponse<Venue>> {
  try {
    await sql`
      DELETE FROM venues
      WHERE id = ${venue.id}
    `
    updateTag('venues')
    return { ok: true }
  } catch (err) {
    return formatErrorResponse('Failed to delete venue', err)
  }
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
      INSERT INTO venues
        address = ${address},
        city = ${city},
        country = ${country},
        name = ${name},
        primary_venue_id = ${primaryVenueId},
        state = ${state},
        timezone = ${timezone},
        url = ${url},
        created_at = current_timestamp
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
