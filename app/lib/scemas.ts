import { z } from 'zod'

export const EmbedCodeSchema = z.object({
  caption: z.string().max(255).optional(),
  id: z.string().optional(),
  iframe: z.string().min(1).max(10000),
})
