'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { runFormAction } from '@/lib/form-action'
import { resolveCoverImageId } from '@/lib/images/actions'
import type { CreateSiteSettings } from '@/lib/site-settings/schemas'
import { createSiteSettingsSchema } from '@/lib/site-settings/schemas'

/**
 * site_settings is a singleton: `id` present updates the existing
 * row, `id` absent creates it (first-run setup — see the gate in
 * src/auth.config.ts, which has no create UI until this runs once).
 */
export async function editSiteSettings(
  formData: FormData,
  id?: string
) {
  return runFormAction({
    formData,
    schema: createSiteSettingsSchema,
    itemType: 'siteSettings',
    prepare: async (data) => {
      const coverImageId = await resolveCoverImageId(data)
      return { ...data, coverImageId }
    },
    invalidate: () => {
      updateTag('settings')
      updateTag('images')
    },
    save: (settings) =>
      id
        ? updateSiteSettings(settings, id)
        : createSiteSettings(settings)
  })
}

async function createSiteSettings({
  coverImageId,
  description,
  title
}: CreateSiteSettings) {
  await sql`
    INSERT INTO site_settings (title, description, cover_image_id)
    VALUES (
      ${title || ''},
      ${description || ''},
      ${coverImageId || null}
    )
  `
}

async function updateSiteSettings(
  { coverImageId, description, title }: CreateSiteSettings,
  id: string
) {
  await sql`
    UPDATE site_settings
    SET title = ${title || ''},
        description = ${description || ''},
        cover_image_id = ${coverImageId || null},
        updated_at = current_timestamp
    WHERE id = ${id}
  `
}
