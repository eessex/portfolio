import type z from 'zod'

import { imageSchema } from '@/lib/images/schemas/db'
import { relationSlugArrays } from '@/lib/schemas/fields'

/**
 * Extends `imageSchema` with the pages that embed it.
 */
export const dashboardImageSchema = imageSchema.extend(
  relationSlugArrays
)
export type DashboardImage = z.infer<typeof dashboardImageSchema>
