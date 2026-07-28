'use client'

import { useEffect, useRef, useState } from 'react'

import type { ProjectClient } from '@/lib/projects/types'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { ItemsList } from '@/ui/items/items-list'
import { useIsAdmin } from '@/ui/useIsAdmin'

/**
 * "More Projects" accordion with client-side draft augmentation:
 * the page renders the published set statically; for signed-in
 * admins this refetches the full set (the API gates drafts on the
 * session cookie) and replaces the list.
 */
export function MoreProjectsList({
  initialProjects,
  className
}: {
  initialProjects: ProjectClient[]
  className?: string
}) {
  const [projects, setProjects] = useState(initialProjects)
  const isAdmin = useIsAdmin()
  const didAugmentRef = useRef(false)

  useEffect(() => {
    if (!isAdmin || didAugmentRef.current) return
    didAugmentRef.current = true

    let cancelled = false

    fetch('/api/projects')
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

  if (projects.length === 0) return null

  return (
    <AccordionDropdown title='More Projects' isFullWidth>
      <ItemsList
        className={className}
        items={projects}
        isCategoryVisible
      />
    </AccordionDropdown>
  )
}
