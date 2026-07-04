import type z from 'zod'

import { linkSchema } from '@/lib/links/schemas/db'
import { relationSlugArrays } from '@/lib/schemas/fields'

/**
 * Extends `linkSchema` with the pages that embed it.
 */
export const dashboardLinkSchema = linkSchema.extend(
  relationSlugArrays
)
export type DashboardLink = z.infer<typeof dashboardLinkSchema>
