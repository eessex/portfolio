'use server'

import { updateTag } from 'next/cache'

import { createAboutSchema } from '@/lib/about/schemas'
import { sql } from '@/lib/db'
import { runFormAction } from '@/lib/form-action'
import { resolveCoverImageId } from '@/lib/images/actions'

export async function editAbout(formData: FormData, id: string) {
  return runFormAction({
    formData,
    schema: createAboutSchema,
    itemType: 'about',
    prepare: async (data) => {
      const coverImageId = await resolveCoverImageId(data)
      return { ...data, coverImageId }
    },
    invalidate: () => {
      updateTag('about')
      updateTag('images')
    },
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
