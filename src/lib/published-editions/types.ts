import type { z } from 'zod'

import type { publishedEditionSchema } from '@/lib/published-editions/schemas'

export type PublishedEdition = z.infer<typeof publishedEditionSchema>
export type PublishedEditionClient = z.infer<
  typeof publishedEditionSchema
>
