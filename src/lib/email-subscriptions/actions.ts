'use server'

import { checkWindowLimit, getClientIp } from '@/lib/auth/rate-limit'
import { sql } from '@/lib/db'
import { emailSubscriptionSchema } from '@/lib/email-subscriptions/schemas'
import { escapeHtml } from '@/lib/strings'
import type { FormResponse } from '@/lib/types'
import {
  formatErrorResponse,
  formatValidationResponse
} from '@/lib/util'

const SUBSCRIBE_LIMIT = 5
const SUBSCRIBE_WINDOW_SECONDS = 60 * 60

/**
 * Save email subscriptions. Deliberately public — unauthenticated
 * visitors subscribe from the public site, so this action must not
 * call requireAuth(). Abuse is limited instead by a honeypot field
 * and a per-IP sliding-window rate limit.
 */
export async function createEmailSubscription<T>(
  formData: FormData
): Promise<FormResponse<T>> {
  // Honeypot: bots fill every field; humans never see this one.
  // Pretend success so bots don't learn they were filtered.
  if (formData.get('contact_preference')) {
    console.warn('createEmailSubscription: honeypot triggered')
    return { ok: true, message: 'Successfully subscribed!' }
  }

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

  let isWithinLimit = true
  try {
    isWithinLimit = await checkWindowLimit(
      `subscribe:${await getClientIp()}`,
      SUBSCRIBE_LIMIT,
      SUBSCRIBE_WINDOW_SECONDS
    )
  } catch (err) {
    // Fail open: a rate-limit outage must not block subscribers,
    console.error(
      'createEmailSubscription: rate limit check failed',
      err
    )
  }
  if (!isWithinLimit) {
    return {
      ok: false,
      message: 'Too many attempts — please try again later.'
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
    return {
      ok: true,
      message: 'Successfully subscribed!'
    }
  } catch (err) {
    return formatErrorResponse('Failed to create subscription', err)
  }
}
