'use server'

import { updateTag } from 'next/cache'

import { aboutSchema } from '@/lib/about/schemas'
import type { About } from '@/lib/about/types'
import { sql } from '@/lib/db'
import type { FormResponse } from '@/lib/types'

export async function editAbout(
  formData: FormData,
  id: string
): Promise<FormResponse<About>> {
  const validatedFields = aboutSchema.safeParse(
    Object.fromEntries(formData)
  )
  if (!validatedFields.success) {
    throw new Error('Validation error', {
      cause: validatedFields.error
    })
  } else {
    const { coverImageId, description } = validatedFields.data

    try {
      await sql`
        UPDATE about
        SET updated_at = current_timestamp,
          description = ${description || ''},
          cover_image_id = ${coverImageId || null}
        WHERE id = ${id}
      `
      updateTag('about')
      return { ok: true }
    } catch (cause) {
      throw new Error('Database Error: Failed to save.', { cause })
    }
  }
}
