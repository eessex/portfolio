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

async function createVenue (venue: CreateVenue) {
  try {
    const maybeId = await sql`SELECT id from venues WHERE name = ${venue.name || ''} AND address = ${venue.address || ''} AND city = ${venue.city} LIMIT 1`

    if (maybeId.length > 0) {
      console.debug('Venue already exists:', maybeId[0].id)
      return {
        ...venue,
        id: maybeId[0].id
      }
    } else {
      const {
        address,
        city,
        country,
        name,
        state,
        url
      } = venue
      console.debug('Creating new venue:', venue)
      return await sql<Venue[]>`
        INSERT INTO venues (
          address,
          city,
          created_at,
          country,
          name,
          state,
          url
        )
        VALUES (
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
    }
  } catch (err) {
    console.error('Error creating venue:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create venue.')
  }
}

export async function editVenue (formData: FormData) {
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)
  Object.entries(data).forEach(([n, v]) => {
    // checkboxes are always 'on' when checked, so we convert them to true
    if (v === 'on') {
      data[n] = true
    } else if (n.includes('Date')) {
      console.info('Parsing date for:', n, v)
      data[n] = v || undefined
    } else if (n === 'url' && v === '') {
      data[n] = undefined
    } else {
      console.debug('Form data entry:', n, v)
      data[n] = v
    }
  })

  let validatedVenue
  if (formData.get('id')) {
    validatedVenue = venueSchema.safeParse(data)
  } else {
    validatedVenue = createVenueSchema.safeParse(data)
  }

  if (!validatedVenue.success) {
    console.error('Failed to validate venue.', validatedVenue.error.flatten().fieldErrors)
    return {
      errors: validatedVenue.error.flatten().fieldErrors,
      message: 'Failed to validate venue.'
    }
  } else {
    try {
      const updatedVenue = await updateVenue(validatedVenue.data)
      if (updatedVenue) {
        console.debug('Venue saved successfully:', updatedVenue)
        revalidatePath('/dashboard/venues')
        return {
          ok: true,
          res: updatedVenue
        }
      }
    } catch (err: unknown) {
      console.error('Failed to save Venue:', err)
      return {
        errors: err instanceof Error ? [err.message] : ['Failed to save Venue.'],
        message: 'Failed to save Venue.'
      }
    }
  }
}

async function updateVenue (venue: CreateVenue | Venue) {
  if (!(venue as Venue).id) {
    try {
      return await createVenue(venue as CreateVenue)
    } catch (err) {
      console.error('Error creating venue:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to create venue.')
    }
  } else {
    const {
      address,
      city,
      country,
      name,
      state,
      url
    } = venue
    try {
      await sql<Venue[]>`
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
    } catch (err) {
      console.error('Error updating venue:', err)
      throw new Error('Failed to update venue.')
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
  } catch (err: Error | unknown) {
    console.error('Error deleting venue:', err)
    return { message: err instanceof Error ? err.message : 'Failed to delete venue.' }
  }
}
