'use server'

import { revalidatePath } from 'next/cache'

import { sql } from '@/lib/db'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'
import {
  createVenueSchema,
  editVenueSchema,
  venueSchema
} from '@/lib/venues/schemas'
import type { CreateVenue, Venue } from '@/lib/venues/types'

export async function editVenue(
  formData: FormData
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

  const validatedVenue = formData.get('id')
    ? editVenueSchema.safeParse(data)
    : createVenueSchema.safeParse(data)

  if (!validatedVenue.success) {
    return {
      ok: false,
      errors: validatedVenue.error.flatten().fieldErrors,
      message: 'Failed to validate venue.'
    }
  }

  try {
    const updatedVenue = await updateVenue(validatedVenue.data)
    revalidatePath('/dashboard/venues')
    return {
      ok: true,
      res: updatedVenue
    }
  } catch (err) {
    const errMsg = 'Failed to edit venue'
    const message =
      err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
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
    revalidatePath('/dashboard/venues')
    return { ok: true }
  } catch (err) {
    const errMsg = 'Failed to delete venue'
    const message =
      err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
    return {
      ok: false,
      message
    }
  }
}

async function createVenue(venue: CreateVenue) {
  try {
    const { address, city, country, name, state, url } = venue
    const rows = await sql`
      INSERT INTO venues (
        address,
        city,
        created_at,
        country,
        name,
        state,
        url
      ) VALUES (
        ${address || null},
        ${city},
        current_timestamp,
        ${country || null},
        ${name || null},
        ${state || null},
        ${url || null}
      )
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

/** if there's an id, create, otherwise update */
async function updateVenue(venue: CreateVenue | Venue) {
  try {
    if (!(venue as Venue).id) {
      return await createVenue(venue as CreateVenue)
    } else {
      const { address, city, country, name, state, url } = venue
      const rows = await sql`
        UPDATE venues
        SET (
          address,
          city,
          country,
          name,
          state,
          updated_at,
          url
        ) = (
          ${address || null},
          ${city},
          ${country || null},
          ${name || null},
          ${state || null},
          current_timestamp,
          ${url || null}
        )
        WHERE id = ${(venue as Venue).id}
        RETURNING *
      `

      const row = rows[0]
      if (!row) throw new Error('Failed to update venue')
      return formatDbResponseForClient(row, venueSchema)
    }
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Failed to update venue.'
    )
  }
}
