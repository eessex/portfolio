'use client'

import type { ProjectType } from '@/lib/projects/schemas'
import type { ProjectClient } from '@/lib/projects/types'
import { buildApiUrl } from '@/ui/api-url'
import { useAdminRefetch } from '@/ui/use-admin-refetch'

/**
 * The projects other than the default one (the `/about` page itself),
 * with drafts revealed for signed-in admins (`useAdminRefetch`), limited
 * without `excludedTypes` when given, like the server-rendered first
 * page.
 */
export function useOtherProjects(
  initialProjects: ProjectClient[],
  excludedTypes?: readonly ProjectType[]
) {
  return useAdminRefetch(
    initialProjects,
    buildApiUrl('/api/projects', {
      isDefaultExcluded: true,
      excludedTypes: excludedTypes?.join(',')
    }),
    pickAllProjects
  )
}

function pickAllProjects(data: unknown) {
  const allProjects = (
    data as { res?: { allProjects?: ProjectClient[] } } | undefined
  )?.res?.allProjects
  return Array.isArray(allProjects) ? allProjects : undefined
}
