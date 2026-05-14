'use server'

import { revalidatePath } from 'next/cache'

import { sql } from '@/lib/db'
import { siteSettingsSchema } from '@/lib/site-settings/schemas'
import type { SiteSettings } from '@/lib/site-settings/types'
import type { FormResponse } from '@/lib/types'

export async function editSiteSettings (formData: FormData, id: string): Promise<FormResponse<SiteSettings>> {
  const validatedFields = siteSettingsSchema.safeParse(Object.fromEntries(formData))
  if (!validatedFields.success) {
    console.error('Validation error', validatedFields.error.format())
    return {
      ok: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to save.'
    }
  } else {
    const {
      coverImageId,
      description,
      title
    } = validatedFields.data

    try {
      await sql`
        UPDATE site_settings
        SET title = ${title || ''},
            description = ${description || ''},
            cover_image_id = ${coverImageId || null},
            updated_at = current_timestamp
        WHERE id = ${id}
      `
      revalidatePath('/dashboard')
      return { ok: true }
    } catch (err) {
      console.error('Database Error', err)
      throw new Error('Database Error: Failed to save.')
    }
  }
}
