'use server'

import { updateTag } from 'next/cache'

import { aboutSchema } from '@/lib/about/schemas'
import type { About } from '@/lib/about/types'
import { sql } from '@/lib/db'
import type { FormResponse } from '@/lib/types'
import {
  formatErrorResponse,
  formatValidationResponse
} from '@/lib/util'

export async function editAbout(
  formData: FormData,
  id: string
): Promise<FormResponse<About>> {
  const validatedFields = aboutSchema.safeParse(
    Object.fromEntries(formData)
  )

  if (!validatedFields.success) {
    return formatValidationResponse(
      validatedFields.error,
      'Failed to validate about page.'
    )
  }

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
  } catch (err) {
    return formatErrorResponse('Failed to save about page', err)
  }
}
