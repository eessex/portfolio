import type { z } from 'zod'

import type {
  aboutClientSchema,
  aboutContactSchema,
  aboutSchema
} from '@/lib/about/schemas'

export type About = z.infer<typeof aboutSchema>
export type AboutContact = z.infer<typeof aboutContactSchema>
export type AboutClient = z.infer<typeof aboutClientSchema>
