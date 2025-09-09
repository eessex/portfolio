import { emailSubscriptionSchema } from '@/lib/email-subscriptions/schemas'
import type { z } from 'zod'

export type EmailSubscription = z.infer<typeof emailSubscriptionSchema>
