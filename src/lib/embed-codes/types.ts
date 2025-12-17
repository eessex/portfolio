import type { z } from 'zod'

import type {
  dashboardEmbedCodeSchema,
  embedCodeSchema
} from '@/lib/embed-codes/schemas'

export type EmbedCode = z.infer<typeof embedCodeSchema>
export type CreateEmbedCode = Omit<EmbedCode, 'id' | 'createdAt' | 'updatedAt'>
export type DashboardEmbedCode = z.infer<typeof dashboardEmbedCodeSchema>
