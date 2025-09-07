import { projectSchema } from '@/lib/projects/schemas'
import type { z } from 'zod'

export type Project = z.infer<typeof projectSchema>
