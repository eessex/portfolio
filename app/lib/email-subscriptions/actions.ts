'use server'

import type { FormResponse } from '@/lib/types'
import { emailSubscriptionSchema } from '@/lib/email-subscriptions/schemas'
import { escapeHtml } from '@/ui/util'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

/** save email subscriptions */
export async function createEmailSubscription<T> (formData: FormData): Promise<FormResponse<T>> {
  const validatedFields = emailSubscriptionSchema.omit({
    exportedAt: true,
    createdAt: true,
    updatedAt: true
  }).safeParse(Object.fromEntries(formData))
  if (!validatedFields.success) {
    console.error('Failed to validate email, try again.', validatedFields.error.flatten().fieldErrors)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate email, try again.',
    }
  }
  const email = formData.get('email') as string
  const cleanedEmail = escapeHtml(email)

  try {
    await sql`
      INSERT INTO email_subscriptions (created_at, updated_at, email)
      VALUES (current_timestamp, current_timestamp, ${cleanedEmail})
      ON CONFLICT (email)
      DO UPDATE SET updated_at = current_timestamp
    `
    return { ok: true, message: 'Successfully subscribed!' }
  } catch (err) {
    console.error(err)
    return {
      message: 'Database Error: Failed to Create subscription.',
    }
  }
}
