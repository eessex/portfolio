'use client'

import type { ProjectClient } from '@/lib/projects/types'
import type { CarouselMediaHeights } from '@/ui/carousel/carousel'
import {
  Carousel,
  CarouselItem,
  mediaSlideSize
} from '@/ui/carousel/carousel'
import { ItemCard } from '@/ui/items/item-card'
import styles from '@/ui/projects/projects-carousel.module.scss'
import { useOtherProjects } from '@/ui/projects/use-other-projects'

// keep in sync with `$media-height*` in `items/_item-card.scss`
const MEDIA_HEIGHTS: CarouselMediaHeights = {
  height: 300,
  narrowHeight: 220
}

/**
 * The projects other than the default one, on `/about`, each linking
 * to its page. Hidden when there are none.
 */
export function ProjectsCarousel({
  initialProjects
}: {
  initialProjects: ProjectClient[]
}) {
  const projects = useOtherProjects(initialProjects)

  if (projects.length === 0) return null

  return (
    <Carousel
      id='projects'
      title='Projects'
      count={projects.length}
      mediaHeights={MEDIA_HEIGHTS}
    >
      {projects.map((project) => (
        <CarouselItem key={project.id}>
          <ItemCard
            item={project}
            className={styles.project}
            imageSize={mediaSlideSize(
              MEDIA_HEIGHTS,
              project.coverImage?.aspect ?? 1
            )}
            isBadgeOnImage
            isCategoryVisible
            isLazy
            isMediaIconsVisible
          />
        </CarouselItem>
      ))}
    </Carousel>
  )
}
