import {
  aboutClientSchema,
  aboutContactSchema,
  aboutSchema
} from '@/lib/about/schemas'
import { z } from 'zod'

export type About = z.infer<typeof aboutSchema>
export type AboutContact = z.infer<typeof aboutContactSchema>
export type AboutClient = z.infer<typeof aboutClientSchema>
