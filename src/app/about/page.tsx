import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import ItemLayout from '@/app/(item-pages)/item-layout'
import { fetchPublishedFirst } from '@/app/(item-pages)/resolve-page-item'
import { ogImage } from '@/lib/images/util'
import {
  fetchCachedDefaultProject,
  fetchCachedProjectsFirstPage
} from '@/lib/projects/cached'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { DraftBadge } from '@/ui/badges/draft-badge'
import { ProjectsCarousel } from '@/ui/projects/projects-carousel'

const title = 'About'

export async function generateMetadata() {
  const [settings, project] = await Promise.all([
    fetchCachedSiteSettings(),
    fetchCachedDefaultProject(false)
  ])

  if (project) {
    const image = project.coverImage
    return {
      title,
      description: project.shortDescription ?? settings?.description,
      openGraph: { images: ogImages(image, image?.alt) }
    }
  }

  const image = settings?.coverImage

  return {
    title,
    description: settings?.description,
    openGraph: { images: ogImages(image, image?.caption) }
  }
}

function ogImages(
  image: Parameters<typeof ogImage>[0] | undefined,
  alt: string | undefined
) {
  const og = image && ogImage(image)
  return og
    ? [
        {
          ...og,
          alt: alt ?? ''
        }
      ]
    : []
}

/** Renders the default project; 404 until one exists. */
export default async function AboutPage() {
  const pageItem = await fetchPublishedFirst(
    fetchCachedDefaultProject
  )

  if (!pageItem) notFound()

  const { item } = pageItem

  return (
    <ItemLayout
      item={item}
      header={<AboutHeader isPublished={item.isPublished} />}
    >
      <Suspense>
        <AboutProjects />
      </Suspense>
    </ItemLayout>
  )
}

/** Just "About" (and a draft badge): no category or date. */
function AboutHeader({ isPublished }: { isPublished: boolean }) {
  return (
    <>
      <h1>{title}</h1>
      {!isPublished && (
        <p className='category'>
          <DraftBadge />
        </p>
      )}
    </>
  )
}

/** The other projects, as a carousel. */
async function AboutProjects() {
  const {
    res: { allProjects }
  } = await fetchCachedProjectsFirstPage(false, true)

  return <ProjectsCarousel initialProjects={allProjects} />
}
