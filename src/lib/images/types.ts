import type { z } from 'zod'

import type {
  dashboardImageSchema,
  imageSchema
} from '@/lib/images/schemas'

export type Image = z.infer<typeof imageSchema>
export type DashboardImage = z.infer<typeof dashboardImageSchema>
