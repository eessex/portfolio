import type { z } from 'zod'

import type { emailSubscriptionSchema } from '@/lib/email-subscriptions/schemas'

export type EmailSubscription = z.infer<
  typeof emailSubscriptionSchema
>
