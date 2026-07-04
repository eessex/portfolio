'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'
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
  const data: Record<FormData['entries']['name'], unknown> =
    Object.fromEntries(formData)
  Object.entries(data).forEach(([n, v]) => {
    // checkboxes are always 'on' when checked, so we convert them to true
    if (v === 'on') {
      data[n] = true
    } else if (n.includes('Date')) {
      data[n] = v || undefined
    } else if (n === 'url' && v === '') {
      data[n] = undefined
    } else {
      data[n] = v
    }
  })

  const validatedVenue = createVenueSchema.safeParse(data)

  if (!validatedVenue.success) {
    return {
      ok: false,
      errors: validatedVenue.error.flatten().fieldErrors,
      message: 'Failed to validate venue.'
    }
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
    const errMsg = 'Failed to edit venue'
    const message =
      err instanceof Error
        ? `${errMsg}: ${err.message}`
        : `${errMsg}.`
    return {
      ok: false,
      message
    }
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
    const errMsg = 'Failed to delete venue'
    const message =
      err instanceof Error
        ? `${errMsg}: ${err.message}`
        : `${errMsg}.`
    return {
      ok: false,
      message
    }
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
    if (!row) throw new Error('Failed to create venue')
    return formatDbResponseForClient(row, venueSchema)
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Failed to create venue.'
    )
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
    if (!row) throw new Error('Failed to update venue')
    return formatDbResponseForClient(row, venueSchema)
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Failed to update venue.'
    )
  }
}

/** DB column default for venues.timezone, applied here since an explicit
 *  NULL would override the column default and violate its NOT NULL constraint */
const DEFAULT_VENUE_TIMEZONE = 'America/New_York'

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
    timezone: venueToSave.timezone ?? DEFAULT_VENUE_TIMEZONE,
    url: venueToSave.url ?? null
  }
}
