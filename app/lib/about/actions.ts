'use server'

import { aboutSchema } from '@/lib/about/schemas'
import type { About } from '@/lib/about/types'
import type { FormResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function editAbout (formData: FormData, id: string): Promise<FormResponse<About>> {
  const validatedFields = aboutSchema.safeParse(Object.fromEntries(formData))
  if (!validatedFields.success) {
    console.error('Validation error', validatedFields.error.format())
    throw new Error('Validation error')
  } else {
    const {
      coverImageId,
      description,
    } = validatedFields.data

    try {
      await sql`
        UPDATE about
        SET updated_at = current_timestamp,
            description = ${description || ''},
            cover_image_id = ${coverImageId || null}
        WHERE id = ${id}
      `
      revalidatePath('/about')
      return { ok: true }
    } catch (err) {
      console.error('Database Error', err)
      throw new Error('Database Error: Failed to save.')
    }
  }
}
