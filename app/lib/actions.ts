'use server'

import { escapeHtml } from '@/ui/util'
import { AuthError } from 'next-auth'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'
import { z } from 'zod'
import { signIn } from '../../auth'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function authenticate (
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}

/** save email subscriptions */
export async function createEmailSubscription (email: string) {
  const cleanedEmail = escapeHtml(email)

  try {
    await sql`
      INSERT INTO email_subscriptions (created_at, email)
      VALUES (current_timestamp, ${cleanedEmail})
    `
    return { ok: true }
  } catch (err) {
    console.error(err)
    return {
      message: 'Database Error: Failed to Create subscription.',
    }
  }
}

const EditSettingsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  coverImageId: z.string().optional(),
})

export async function editSiteSettings (formData: FormData, id: string) {
  const validatedFields = EditSettingsSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    coverImageId: formData.get('coverImageId'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to save.',
    }
  } else {
    const { title, description, coverImageId } = validatedFields.data

    try {
      await sql`
        UPDATE site_settings
        SET title = ${title}, description = ${description || ''}, cover_image_id = ${coverImageId || ''}, updated_at = current_timestamp
        WHERE id = ${id}
      `
      revalidatePath('/dashboard')
    } catch (error) {
      throw new Error('Database Error: Failed to update settings.')
    }
  }
}
