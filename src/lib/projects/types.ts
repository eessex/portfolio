import { projectSchema } from '@/lib/projects/schemas'
import { z } from 'zod'

export type Project = z.infer<typeof projectSchema>
