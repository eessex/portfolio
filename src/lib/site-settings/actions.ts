'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { runFormAction } from '@/lib/form-action'
import { siteSettingsSchema } from '@/lib/site-settings/schemas'

export async function editSiteSettings(
  formData: FormData,
  id: string
) {
  return runFormAction({
    formData,
    schema: siteSettingsSchema,
    itemType: 'siteSettings',
    invalidate: () => updateTag('settings'),
    save: async ({ coverImageId, description, title }) => {
      await sql`
        UPDATE site_settings
        SET title = ${title || ''},
            description = ${description || ''},
            cover_image_id = ${coverImageId || null},
            updated_at = current_timestamp
        WHERE id = ${id}
      `
    }
  })
}
