'use server'

import type { FormResponse } from '@/lib/definitions'
import { siteSettingsSchema } from '@/lib/site-settings/schemas'
import { SiteSettings } from '@/lib/site-settings/types'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function editSiteSettings (formData: FormData, id: string): Promise<FormResponse<SiteSettings>> {
  const validatedFields = siteSettingsSchema.safeParse(Object.fromEntries(formData))
  if (!validatedFields.success) {
    console.error('Validation error', validatedFields.error.format())
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to save.',
    }
  } else {
    const {
      coverImageId,
      description,
      title,
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
