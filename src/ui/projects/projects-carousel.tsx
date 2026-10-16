'use client'

import NextImage from 'next/image'
import NextLink from 'next/link'

import type { ProjectClient } from '@/lib/projects/types'
import { DraftBadge } from '@/ui/badges/draft-badge'
import type { CarouselMediaHeights } from '@/ui/carousel/carousel'
import {
  Carousel,
  CarouselItem,
  mediaSlideSize
} from '@/ui/carousel/carousel'
import { FormattedItemDate } from '@/ui/items/item-date'
import styles from '@/ui/projects/projects-carousel.module.scss'
import { useOtherProjects } from '@/ui/projects/use-other-projects'
import { formattedItemType, itemUrl } from '@/ui/util'

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
      {projects.map((project) => {
        const { coverImage } = project
        const aspect = coverImage?.aspect ?? 1
        const { width, sizes } = mediaSlideSize(MEDIA_HEIGHTS, aspect)

        return (
          <CarouselItem key={project.id}>
            <NextLink
              href={itemUrl(project)}
              className={styles.project}
            >
              <span className={styles.media}>
                {coverImage ? (
                  <NextImage
                    src={coverImage.url}
                    alt={coverImage.alt || ''}
                    width={width}
                    height={MEDIA_HEIGHTS.height}
                    sizes={sizes}
                    loading='lazy'
                    style={{ aspectRatio: aspect }}
                  />
                ) : (
                  <span className={styles.placeholder} />
                )}
                {!project.isPublished && <DraftBadge />}
              </span>
              <span className={styles.text}>
                <span className={styles.title}>{project.title}</span>
                {project.type && (
                  <span className={styles.type}>
                    {formattedItemType(project.type).trim()}
                  </span>
                )}
                {project.startDate && (
                  <span className={styles.years}>
                    <FormattedItemDate item={project} />
                  </span>
                )}
              </span>
            </NextLink>
          </CarouselItem>
        )
      })}
    </Carousel>
  )
}
