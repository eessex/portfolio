import type { z } from 'zod'

import type { dashboardLinkSchema, linkSchema } from '@/lib/links/schemas'

export type Link = z.infer<typeof linkSchema>
export type DashboardLink = z.infer<typeof dashboardLinkSchema>
