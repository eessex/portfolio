import { checkWindowLimit, getClientIp } from '@/lib/auth/rate-limit'
import { sql } from '@/lib/db'
import {
  ELAPSED_FIELD,
  HONEYPOT_FIELD,
  MIN_ELAPSED_MS
} from '@/lib/email-subscriptions/form-fields'
import { emailSubscriptionSchema } from '@/lib/email-subscriptions/schemas'
import { suspiciousReason } from '@/lib/email-subscriptions/spam-rules'
import type { FormResponse } from '@/lib/types'
import {
  formatErrorResponse,
  formatValidationResponse
} from '@/lib/util'

const SUCCESS = { ok: true, message: 'Successfully subscribed!' }

const SUBSCRIBE_LIMIT = 5
const SUBSCRIBE_WINDOW_SECONDS = 60 * 60

/**
 * Saves a subscription. Deliberately public, and deliberately not a
 * server action: it's reached only through POST /api/subscribe,
 * which BotID protects (an action could be POSTed by id, around it).
 * Bots caught by BotID, the honeypot or the timing check get a fake
 * success so they don't learn what gave them away; addresses the
 * spam rules match are saved but flagged as spam.
 */
export async function createEmailSubscription<T>(
  formData: FormData,
  { isBot = false }: { isBot?: boolean } = {}
): Promise<FormResponse<T>> {
  const elapsed = Number(formData.get(ELAPSED_FIELD))
  const botSignal = isBot
    ? 'botid'
    : formData.get(HONEYPOT_FIELD)
      ? 'honeypot'
      : !(elapsed >= MIN_ELAPSED_MS)
        ? 'too fast'
        : null
  if (botSignal) {
    console.warn(`createEmailSubscription: ${botSignal}`)
    return SUCCESS
  }

  const validatedFields = emailSubscriptionSchema
    .omit({
      id: true,
      exportedAt: true,
      isSpam: true,
      spamReason: true,
      isSpamReviewed: true,
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

  const { email } = validatedFields.data
  const reason = suspiciousReason(email)

  try {
    // a re-subscribe keeps its spam state and exported_at
    await sql`
      INSERT INTO email_subscriptions
        (created_at, updated_at, email, is_spam, spam_reason)
      VALUES (current_timestamp, current_timestamp, ${email},
        ${reason !== null}, ${reason})
      ON CONFLICT (email)
      DO UPDATE SET updated_at = current_timestamp
    `
    return SUCCESS
  } catch (err) {
    return formatErrorResponse('Failed to create subscription', err)
  }
}
