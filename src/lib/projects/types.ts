import type { z } from 'zod'

import type {
  projectClientSchema,
  projectSchema
} from '@/lib/projects/schemas'

export type Project = z.infer<typeof projectSchema>
export type ProjectClient = z.infer<typeof projectClientSchema>

export interface FetchProjectsResult {
  allProjects: ProjectClient[]
}
