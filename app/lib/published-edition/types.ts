import { publishedEditionSchema } from '@/lib/published-edition/schemas'
import type { z } from 'zod'

export type PublishedEdition = z.infer<typeof publishedEditionSchema>
export type PublishedEditionClient = z.infer<typeof publishedEditionSchema>
