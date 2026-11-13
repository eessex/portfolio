import { z } from 'zod'

import { spamReasons } from '@/lib/email-subscriptions/spam-reasons'
import { systemFields } from '@/lib/schemas/fields'
import { bool, date, email } from '@/lib/schemas/primitives'

/**
 * Newsletter subscription
 */
export const emailSubscriptionSchema = z.object({
  ...systemFields,
  email,
  exportedAt: date.optional(),
  isSpam: bool,
  spamReason: z.enum(spamReasons).optional(),
  isSpamReviewed: bool
})

/** For reading stored rows, some saved before addresses were validated */
export const storedEmailSubscriptionSchema =
  emailSubscriptionSchema.extend({ email: z.string() })

export const exportScopes = ['all', 'new'] as const
export const exportScopeSchema = z.enum(exportScopes)
