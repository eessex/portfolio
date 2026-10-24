import type z from 'zod'

import {
  imageObjectSchema,
  withPublicUrl
} from '@/lib/images/schemas/db'
import { relationSlugArrays } from '@/lib/schemas/fields'

/**
 * Extends `imageSchema` with the pages that embed it.
 */
export const dashboardImageSchema = imageObjectSchema
  .extend(relationSlugArrays)
  .transform(withPublicUrl)
export type DashboardImage = z.infer<typeof dashboardImageSchema>
