'use server'

import { embedCodeSchema } from '@/lib/embed-codes/schemas'
import { imageSchema } from '@/lib/images/schemas'
import { linkSchema } from '@/lib/links/schemas'
import { escapeHtml } from '@/ui/util'
import { AuthError } from 'next-auth'
import postgres from 'postgres'
import { z } from 'zod'
import { signIn } from '../../../auth'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

const embeddedItems = {
  embedCode: embedCodeSchema,
  image: imageSchema,
  link: linkSchema
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

export async function validatedItemArray (
  formData: FormData,
  prefix: EmbeddedItemKey
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
