import { tagSchema } from '@/lib/tags/schemas'
import { z } from 'zod'

export type Tag = z.infer<typeof tagSchema>
