import type { z } from 'zod'

import type {
  exportScopeSchema,
  storedEmailSubscriptionSchema,
  subscribersExportRecordSchema
} from '@/lib/email-subscriptions/schemas'

export type EmailSubscription = z.infer<
  typeof storedEmailSubscriptionSchema
>

export type ExportScope = z.infer<typeof exportScopeSchema>

export type SubscribersExportRecord = z.infer<
  typeof subscribersExportRecordSchema
>

export interface EmailSubscriptionsPage {
  items: EmailSubscription[]
  page: number
  pageCount: number
  totalCount: number
  unexportedCount: number
  spamCount: number
  recentExports: SubscribersExportRecord[]
}
