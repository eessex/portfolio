'use client'

import type { ProjectClient } from '@/lib/projects/types'
import { useAdminRefetch } from '@/ui/use-admin-refetch'

/**
 * The projects other than the default one (the `/about` page itself),
 * with drafts revealed for signed-in admins (`useAdminRefetch`).
 */
export function useOtherProjects(initialProjects: ProjectClient[]) {
  return useAdminRefetch(
    initialProjects,
    '/api/projects?isDefaultExcluded=true',
    pickAllProjects
  )
}

function pickAllProjects(data: unknown) {
  const allProjects = (
    data as { res?: { allProjects?: ProjectClient[] } } | undefined
  )?.res?.allProjects
  return Array.isArray(allProjects) ? allProjects : undefined
}
