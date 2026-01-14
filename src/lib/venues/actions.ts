'use server'

import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'
import {
  createVenueSchema,
  venueSchema
} from '@/lib/venues/schemas'
import type {
  CreateVenue,
  Venue
} from '@/lib/venues/types'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function editVenue (formData: FormData): Promise<FormResponse<Venue>> {
  let validatedVenue
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)
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

  if (formData.get('id')) {
    validatedVenue = venueSchema.safeParse(data)
  } else {
    validatedVenue = createVenueSchema.safeParse(data)
  }

  if (!validatedVenue.success) {
    return {
      errors: validatedVenue.error.flatten().fieldErrors,
      message: 'Failed to validate venue.'
    }
  } else {
    try {
      const updatedVenue = await updateVenue(validatedVenue.data)
      if (updatedVenue) {
        revalidatePath('/dashboard/venues')
        return {
          ok: true,
          res: updatedVenue
        }
      }
    } catch (err) {
      const errMsg = 'Failed to edit venue'
      const message = err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
      return { message }
    }
  }
}

export async function deleteVenue (venue: Venue): Promise<FormResponse<Venue>> {
  try {
    await sql`
      DELETE FROM venues
      WHERE id = ${venue.id}
    `
    revalidatePath('/dashboard/venues')
    return { ok: true }
  } catch (err) {
    const errMsg = 'Failed to delete venue'
    const message = err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
    return { message }
  }
}

async function createVenue (venue: CreateVenue) {
  try {
    const {
      address,
      city,
      country,
      name,
      state,
      url
    } = venue
    return await sql<Venue[]>`
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
    `.then(rows => formatDbResponseForClient(rows[0], venueSchema))
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to create venue.')
  }
}

/** if there's an id, create, otherwise update */
async function updateVenue (venue: CreateVenue | Venue) {
  try {
    if (!(venue as Venue).id) {
      return await createVenue(venue as CreateVenue)
    } else {
      const {
        address,
        city,
        country,
        name,
        state,
        url
      } = venue
      return await sql<Venue[]>`
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
      `.then(rows => formatDbResponseForClient(rows[0], venueSchema))
    }
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to update venue.')
  }
}
