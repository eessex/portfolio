'use server'

import { updateTag } from 'next/cache'

import { requireAuth } from '@/lib/auth/guard'
import { sql } from '@/lib/db'
import { siteSettingsSchema } from '@/lib/site-settings/schemas'
import type { SiteSettings } from '@/lib/site-settings/types'
import type { FormResponse } from '@/lib/types'
import {
  formatErrorResponse,
  formatValidationResponse
} from '@/lib/util'

export async function editSiteSettings(
  formData: FormData,
  id: string
): Promise<FormResponse<SiteSettings>> {
  const denied = await requireAuth()
  if (denied) return denied

  const validatedFields = siteSettingsSchema.safeParse(
    Object.fromEntries(formData)
  )

  if (!validatedFields.success) {
    return formatValidationResponse(
      validatedFields.error,
      'Failed to validate site settings.'
    )
  }

  const { coverImageId, description, title } = validatedFields.data

  try {
    await sql`
      UPDATE site_settings
      SET title = ${title || ''},
          description = ${description || ''},
          cover_image_id = ${coverImageId || null},
          updated_at = current_timestamp
      WHERE id = ${id}
    `
    updateTag('settings')
    return { ok: true }
  } catch (err) {
    return formatErrorResponse('Failed to save site settings', err)
  }
}
