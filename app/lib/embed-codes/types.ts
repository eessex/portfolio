import { dashboardEmbedCodeSchema, embedCodeSchema } from '@/lib/embed-codes/schemas'
import type { z } from 'zod'

export type EmbedCode = z.infer<typeof embedCodeSchema>
export type DashboardEmbedCode = z.infer<typeof dashboardEmbedCodeSchema>
