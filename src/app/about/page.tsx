import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import ItemLayout from '@/app/(item-pages)/item-layout'
import { isAuthed } from '@/lib/auth/guard'
import {
  fetchCachedDefaultProject,
  fetchCachedProjectsFirstPage
} from '@/lib/projects/cached'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
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
  image: { url: string; aspect: number } | undefined,
  alt: string | undefined
) {
  return image
    ? [
        {
          url: image.url,
          width: 1200,
          height: Math.round(1200 * image.aspect),
          alt: alt ?? ''
        }
      ]
    : []
}

/** Renders the default project; 404 until one exists. */
export default async function AboutPage() {
  const project = await fetchDefaultProjectForViewer()

  if (!project) notFound()

  return (
    <ItemLayout item={project}>
      <Suspense>
        <AboutProjects />
      </Suspense>
    </ItemLayout>
  )
}

/**
 * The published default project, else an unpublished one for a
 * signed-in admin. Checks a draft exists before reading the session,
 * so the page stays static for anonymous visitors whenever it can.
 */
async function fetchDefaultProjectForViewer() {
  const published = await fetchCachedDefaultProject(false)
  if (published) return published

  const draft = await fetchCachedDefaultProject(true)
  if (!draft) return undefined

  return (await isAuthed()) ? draft : undefined
}

/** The other projects, as a carousel. */
async function AboutProjects() {
  const {
    res: { allProjects }
  } = await fetchCachedProjectsFirstPage(false, true)

  return <ProjectsCarousel initialProjects={allProjects} />
}
