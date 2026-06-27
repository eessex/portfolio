import { date, defaultSchema, email } from '@/lib/schemas'

/**
 * Newsletter subscription
 */
export const emailSubscriptionSchema = defaultSchema
  .omit({ id: true })
  .extend({
    email,
    exportedAt: date.optional()
  })
