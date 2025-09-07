import { tagSchema } from '@/lib/tags/schemas'
import type { z } from 'zod'

export type Tag = z.infer<typeof tagSchema>
