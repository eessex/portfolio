'use server'

import { sql } from '@/lib/db'
import { emailSubscriptionSchema } from '@/lib/email-subscriptions/schemas'
import { escapeHtml } from '@/lib/strings'
import type { FormResponse } from '@/lib/types'
import {
  formatErrorResponse,
  formatValidationResponse
} from '@/lib/util'

/**
 * Save email subscriptions. Deliberately public — unauthenticated
 * visitors subscribe from the public site, so this action must not
 * call requireAuth().
 */
export async function createEmailSubscription<T>(
  formData: FormData
): Promise<FormResponse<T>> {
  const validatedFields = emailSubscriptionSchema
    .omit({
      id: true,
      exportedAt: true,
      createdAt: true,
      updatedAt: true
    })
    .safeParse(Object.fromEntries(formData))

  if (!validatedFields.success) {
    return formatValidationResponse(
      validatedFields.error,
      'Failed to validate email, try again.'
    )
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
    return {
      ok: true,
      message: 'Successfully subscribed!'
    }
  } catch (err) {
    return formatErrorResponse('Failed to create subscription', err)
  }
}
