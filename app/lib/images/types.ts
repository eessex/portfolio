import { dashboardImageSchema, imageSchema } from '@/lib/images/schemas'
import { z } from 'zod'

export type Image = z.infer<typeof imageSchema>
export type DashboardImage = z.infer<typeof dashboardImageSchema>
