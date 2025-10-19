import type { z } from 'zod'

import type {
  dashboardLinkSchema,
  linkSchema
} from '@/lib/links/schemas'

export type Link = z.infer<typeof linkSchema>
export type CreateLink = Omit<Link, 'id' | 'createdAt' | 'updatedAt'>

export type DashboardLink = z.infer<typeof dashboardLinkSchema>
