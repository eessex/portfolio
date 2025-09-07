import { dashboardLinkSchema, linkSchema } from '@/lib/links/schemas'
import type { z } from 'zod'

export type Link = z.infer<typeof linkSchema>
export type DashboardLink = z.infer<typeof dashboardLinkSchema>
