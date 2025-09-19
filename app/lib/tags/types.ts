import type { z } from 'zod'

import type { tagSchema } from '@/lib/tags/schemas'

export type Tag = z.infer<typeof tagSchema>
