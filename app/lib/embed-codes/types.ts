import { dashboardEmbedCodeSchema, embedCodeSchema } from '@/lib/embed-codes/schemas'
import { z } from 'zod'

export type EmbedCode = z.infer<typeof embedCodeSchema>
export type DashboardEmbedCode = z.infer<typeof dashboardEmbedCodeSchema>
