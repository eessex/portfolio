import type { z } from 'zod'

import type {
  createProjectSchema,
  projectClientSchema,
  projectSchema
} from '@/lib/projects/schemas'

export type Project = z.infer<typeof projectSchema>
export type ProjectClient = z.infer<typeof projectClientSchema>
export type CreateProject = z.infer<typeof createProjectSchema>

export interface FetchProjectsResult {
  allProjects: ProjectClient[]
}
