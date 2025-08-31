'use server'

import { FormResponse, Venue } from '@/lib/definitions'
import { VenueSchema } from '@/lib/scemas'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createVenue (venue: Venue) {
  try {
    const maybeId = await sql`SELECT id from venues WHERE name = ${venue.name || ''} AND address = ${venue.address || ''} AND city = ${venue.city} LIMIT 1`

    if (maybeId.length > 0) {
      console.debug('Venue already exists:', maybeId[0].id)
      return { ...venue, id: maybeId[0].id }
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
      const result = await sql<Venue[]>`
      INSERT INTO venues (
          address,
          created_at,
          city,
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
      `
      if (result.length > 0) {
        console.debug('Venue created successfully:', result[0])
        return result[0]
      }
    }
  } catch (err) {
    console.error('Error creating venue:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create venue.')
  }
  return null
}

export async function editVenue (formData: FormData): Promise<FormResponse<Venue>> {
  const data: Record<FormData['entries']['name'], unknown> = {}
  formData.entries().forEach(([n, v]) => {
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
  const validatedFields = VenueSchema.safeParse(data)
  if (!validatedFields.success) {
    console.error('Failed to validate venue.', validatedFields.error.flatten().fieldErrors)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate venue.',
    }
  } else {
    try {
      const venue = validatedFields.data as Venue
      const updatedVenues = await updateVenue(venue)
      if (updatedVenues) {
        console.debug('Venue saved successfully:', updatedVenues)
        revalidatePath('/dashboard/venues')
        return { ok: true, res: updatedVenues[0] }
      }
    } catch (err: unknown) {
      console.error('Failed to save Venue:', err)
      return {
        errors: err instanceof Error ? [err.message] : ['Failed to save Venue.'],
        message: 'Failed to save Venue.',
      }
    }
  }
}

async function updateVenue (venue: Venue) {
  let savedVenue: Venue | null = null
  try {
    await sql.begin(async (tx) => {
      const {
        address,
        city,
        country,
        id,
        name,
        state,
        url
      } = venue
      if (!id) {
        try {
          const res = await createVenue(venue)
          if (res?.id) {
            savedVenue = res
          }
        } catch (err) {
          console.error('Error creating venue:', err)
          throw new Error(err instanceof Error ? err.message : 'Failed to create venue.')
        }
      } else {
        try {
          await tx`
            UPDATE venues
            SET (
              address,
              city,
              country,
              name,
              state,
              updated_at,
              url
            )
            = (
              ${address || null},
              ${city},
              ${country || null},
              ${name || null},
              ${state || null},
              current_timestamp,
              ${url || null}
            )
            WHERE id = ${id}
          `.then(() => {
              savedVenue = venue
            })
        } catch (err) {
          console.error('Error updating venue:', err)
          throw new Error('Failed to update venue.')
        }
      }
    })
    return savedVenue
  } catch (err) {
    console.error('Error saving venues:', err)
  }
}

export async function deleteVenue (id: string): Promise<FormResponse<Venue>> {
  try {
    await sql`
      DELETE FROM venues
      WHERE id = ${id}
    `
    revalidatePath('/dashboard/venues')
    return { ok: true }
  } catch (err: Error | unknown) {
    console.error('Error deleting venue:', err)
    return {
      errors: {},
      message: err instanceof Error ? err.message : 'Failed to delete venue.'
    }
  }
}
