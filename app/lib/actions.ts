'use server'

import { signIn } from '../../auth'
import { AuthError } from 'next-auth'
import { escapeHtml } from '@/ui/util'
import postgres from 'postgres'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

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

const EditAboutSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().max(15000).optional(),
  coverImageId: z.string()
})

export async function editAbout (formData: FormData, id: string) {
  const data: Record<FormData['entries']['name'], unknown> = {}
  formData.entries().forEach(([n, v]) => { data[n] = v })

  const validatedFields = EditAboutSchema.safeParse(data)
  console.info('validatedFields', validatedFields)
  if (!validatedFields.success) {
    console.error('Validation error', validatedFields.error.format())
    throw new Error('Validation error')
  } else {
    const [title, description, coverImageId] = Object.entries(validatedFields.data).map(([_key, value]) => value)

    try {
      await sql`
        UPDATE about
        SET updated_at = current_timestamp,
            title = ${title},
            description = ${description},
            cover_image_id = ${coverImageId}
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
