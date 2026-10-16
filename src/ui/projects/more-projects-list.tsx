'use client'

import type { ProjectClient } from '@/lib/projects/types'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { ItemsList } from '@/ui/items/items-list'
import { useOtherProjects } from '@/ui/projects/use-other-projects'

/**
 * "More Projects" accordion on the legacy `/about`, leaving out the
 * default project, with admin draft augmentation.
 */
export function MoreProjectsList({
  initialProjects,
  className
}: {
  initialProjects: ProjectClient[]
  className?: string
}) {
  const projects = useOtherProjects(initialProjects)

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
