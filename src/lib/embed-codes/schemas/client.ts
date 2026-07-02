import type z from 'zod'

import { embedCodeSchema } from '@/lib/embed-codes/schemas/db'
import { relationSlugArrays } from '@/lib/schemas/fields'

/**
 * Extends `embedCodeSchema` with the pages that embed it.
 */
export const dashboardEmbedCodeSchema = embedCodeSchema.extend(
  relationSlugArrays
)
export type DashboardEmbedCode = z.infer<
  typeof dashboardEmbedCodeSchema
>
