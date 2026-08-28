'use server'

import { updateTag } from 'next/cache'

import type { CreateAbout } from '@/lib/about/schemas'
import { createAboutSchema } from '@/lib/about/schemas'
import { sql } from '@/lib/db'
import { runFormAction } from '@/lib/form-action'
import { resolveCoverImageId } from '@/lib/images/actions'

/**
 * about is a singleton: `id` present updates the existing row, `id`
 * absent creates it (first-run setup — mirrors site_settings).
 */
export async function editAbout(formData: FormData, id?: string) {
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
    save: (about) =>
      id ? updateAbout(about, id) : createAbout(about)
  })
}

async function createAbout({
  coverImageId,
  description
}: CreateAbout) {
  await sql`
    INSERT INTO about (
      slug,
      description,
      cover_image_id,
      created_at
    )
    VALUES (
      'about',
      ${description || ''},
      ${coverImageId || null},
      current_timestamp
    )
  `
}

async function updateAbout(
  { coverImageId, description }: CreateAbout,
  id: string
) {
  await sql`
    UPDATE about
    SET
      updated_at = current_timestamp,
      description = ${description || ''},
      cover_image_id = ${coverImageId || null}
    WHERE id = ${id}
  `
}
