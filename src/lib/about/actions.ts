'use server'

import { updateTag } from 'next/cache'

import { aboutSchema } from '@/lib/about/schemas'
import { sql } from '@/lib/db'
import { runFormAction } from '@/lib/form-action'

export async function editAbout(formData: FormData, id: string) {
  return runFormAction({
    formData,
    schema: aboutSchema,
    itemType: 'about',
    invalidate: () => updateTag('about'),
    save: async ({ coverImageId, description }) => {
      await sql`
        UPDATE about
        SET updated_at = current_timestamp,
          description = ${description || ''},
          cover_image_id = ${coverImageId || null}
        WHERE id = ${id}
      `
    }
  })
}
