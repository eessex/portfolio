import type { z } from 'zod'

import type { projectSchema } from '@/lib/projects/schemas'

export type Project = z.infer<typeof projectSchema>
