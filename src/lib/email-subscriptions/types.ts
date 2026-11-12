import type { z } from 'zod'

import type {
  exportScopeSchema,
  storedEmailSubscriptionSchema
} from '@/lib/email-subscriptions/schemas'

export type EmailSubscription = z.infer<
  typeof storedEmailSubscriptionSchema
>

export type ExportScope = z.infer<typeof exportScopeSchema>

/** `items`/`page`/`pageCount` are the never-exported subscribers */
export interface EmailSubscriptionsPage {
  items: EmailSubscription[]
  page: number
  pageCount: number
  activeCount: number
  unexportedCount: number
  exportedItems: EmailSubscription[]
  exportedPage: number
  exportedPageCount: number
  exportedCount: number
  spamItems: EmailSubscription[]
  spamPage: number
  spamPageCount: number
  spamCount: number
}
