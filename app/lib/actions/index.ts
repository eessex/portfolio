'use server'

import { escapeHtml } from '@/ui/util'
import { AuthError } from 'next-auth'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'
import { signIn } from '../../../auth'
import {
  AboutSchema,
  EmbedCodeSchema,
  ImageSchema,
  LinkSchema,
  SettingsSchema
} from '@/lib/scemas'
import { z } from 'zod'
import type {
  About,
  FormResponse,
  SiteSettings
} from '@/lib/definitions'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

const embeddedItems = {
  embedCode: EmbedCodeSchema,
  image: ImageSchema,
  link: LinkSchema
}

export type EmbeddedItemKey = keyof typeof embeddedItems

export async function authenticate (
  _prevState: string | undefined,
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

export async function editSiteSettings (formData: FormData, id: string): Promise<FormResponse<SiteSettings>> {
  const data: Record<FormData['entries']['name'], unknown> = {}
  formData.entries().forEach(([n, v]) => { data[n] = v })

  const validatedFields = SettingsSchema.safeParse(data)
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

export async function editAbout (formData: FormData, id: string): Promise<FormResponse<About>> {
  const data: Record<FormData['entries']['name'], unknown> = {}
  formData.entries().forEach(([n, v]) => { data[n] = v })
  const validatedFields = AboutSchema.safeParse(data)

  if (!validatedFields.success) {
    console.error('Validation error', validatedFields.error.format())
    throw new Error('Validation error')
  } else {
    const {
      coverImageId,
      description,
      title,
    } = validatedFields.data

    try {
      await sql`
        UPDATE about
        SET updated_at = current_timestamp,
            title = ${title || ''},
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

export async function validatedItemArray (
  formData: FormData,
  prefix: keyof typeof embeddedItems
): Promise<z.infer<typeof embeddedItems[EmbeddedItemKey]>[]> {
  const items: Record<string, unknown>[] = []
  const prefixRegex = new RegExp(`^${prefix}\\[(\\d+)\\]\\.(\\w+)$`)
  await formData.entries().forEach(([k, v]) => {
    const match = k.match(prefixRegex)
    if (match) {
      const index = parseInt(match[1])
      const key = match[2] // 'title', 'url', etc.
      const newEntry: Record<string, unknown> = items[index] || {}

      newEntry[key] = v.toString()
      items[index] = newEntry
    }
  })

  const validatedItems = z.array(embeddedItems[prefix]).safeParse(items)
  if (!validatedItems.success) {
    console.error(`Failed to validate ${prefix}s`, validatedItems.error.flatten().fieldErrors)
    throw new Error(`Failed to validate ${prefix}s.`)
  }

  return validatedItems.data
}
