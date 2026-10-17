'use client'

import { useEffect, useRef, useState } from 'react'

import type { ProjectClient } from '@/lib/projects/types'
import { useIsAdmin } from '@/ui/useIsAdmin'

/**
 * The projects other than the default one (the `/about` page itself),
 * with client-side draft augmentation: starts from the statically
 * rendered published set; for signed-in admins this refetches the
 * full set (the API gates drafts on the session cookie) and replaces it.
 */
export function useOtherProjects(initialProjects: ProjectClient[]) {
  const [projects, setProjects] = useState(initialProjects)
  const isAdmin = useIsAdmin()
  const didAugmentRef = useRef(false)

  useEffect(() => {
    if (!isAdmin || didAugmentRef.current) return
    didAugmentRef.current = true

    let cancelled = false

    fetch('/api/projects?isDefaultExcluded=true')
      .then((res) => res.json())
      .then((data: { res?: { allProjects?: ProjectClient[] } }) => {
        const allProjects = data?.res?.allProjects
        if (!cancelled && Array.isArray(allProjects)) {
          setProjects(allProjects)
        }
      })
      .catch(() => {
        // static published list stands
      })

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  return projects
}
