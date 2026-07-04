import { z } from 'zod'

import { systemFields } from '@/lib/schemas/fields'
import { date, email } from '@/lib/schemas/primitives'

/**
 * Newsletter subscription
 */
export const emailSubscriptionSchema = z.object({
  ...systemFields,
  email,
  exportedAt: date.optional()
})
