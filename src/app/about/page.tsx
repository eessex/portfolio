import { Suspense } from 'react'

import ItemLayout from '@/app/(item-pages)/item-layout'
import styles from '@/app/about/about.module.scss'
import { fetchCachedAboutPage } from '@/lib/about/cached'
import type { AboutContact } from '@/lib/about/types'
import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedPressImagesFirstPage } from '@/lib/images/cached'
import { fetchCachedPressLinks } from '@/lib/links/cached'
import {
  fetchCachedDefaultProject,
  fetchCachedProjectsFirstPage
} from '@/lib/projects/cached'
import { fetchProjects } from '@/lib/projects/data'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { ImageFigure } from '@/ui/images/image-figure'
import { ImageGrid } from '@/ui/images/image-grid'
import { LinksList } from '@/ui/links/link-list'
import { MoreProjectsList } from '@/ui/projects/more-projects-list'
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

  const about = await fetchCachedAboutPage()
  const image = (about || settings)?.coverImage

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

/**
 * Renders the default project when one exists, else the legacy
 * `about` page (until the migration creates the default project).
 */
export default async function AboutPage() {
  const project = await fetchDefaultProjectForViewer()

  if (!project) return <LegacyAbout />

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

/** The `about` table's page, until the default project replaces it. */
function LegacyAbout() {
  return (
    <article className={styles.about}>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense>
        <AboutIntro />
      </Suspense>

      <div className={styles['press-info']}>
        <Suspense>
          <MoreProjects />
        </Suspense>

        <Suspense>
          <MoreImages />
        </Suspense>

        <Suspense>
          <MorePress />
        </Suspense>
      </div>
    </article>
  )
}

/** Cover image, bio, contact details, and press quotes. */
async function AboutIntro() {
  const [about, links] = await Promise.all([
    fetchCachedAboutPage(),
    fetchCachedPressLinks()
  ])

  const pressLinksWithQuotes = links.filter((link) => link.quotation)

  return (
    <section>
      {about?.coverImageId && about.coverImage && (
        <ImageFigure
          image={{
            ...about.coverImage,
            id: about.coverImageId
          }}
          className={styles['cover-image']}
          isPriority
        />
      )}

      {about?.description && (
        <p style={{ whiteSpace: 'pre-line' }}>{about.description}</p>
      )}

      {about?.contactInfo?.map(
        ({ title, contact }: AboutContact, i) => (
          <p key={i}>
            {title && <b>{title}: </b>}
            {contact}
          </p>
        )
      )}

      <LinksList
        className={styles['links-list']}
        links={pressLinksWithQuotes}
        isPress
      />
    </section>
  )
}

/** Collapsible list of other projects, leaving out the default. */
async function MoreProjects() {
  const {
    res: { allProjects }
  } = await fetchProjects(false, undefined, undefined, {
    isDefaultExcluded: true
  })

  return (
    <MoreProjectsList
      initialProjects={allProjects}
      className={styles['projects-list']}
    />
  )
}

/** Collapsible grid of press images, excluding the cover image. */
async function MoreImages() {
  const [about, pressImages] = await Promise.all([
    fetchCachedAboutPage(),
    fetchCachedPressImagesFirstPage()
  ])

  // Not paginated: the first page of press photos is enough here.
  const filteredPressImages = pressImages.res.filter(
    (image) =>
      !!(
        !image.isHiddenOnAboutPage && image.id !== about?.coverImageId
      )
  )

  if (!filteredPressImages.length) return null

  return (
    <AccordionDropdown title='More Images' isFullWidth>
      <ImageGrid images={filteredPressImages} />
    </AccordionDropdown>
  )
}

/** Collapsible list of press links without pull-quotes. */
async function MorePress() {
  const links = await fetchCachedPressLinks()

  const pressLinksWithoutQuotes = links.filter(
    (link) => !link.quotation
  )

  if (!pressLinksWithoutQuotes.length) return null

  return (
    <AccordionDropdown title='More Press' isFullWidth>
      <LinksList links={pressLinksWithoutQuotes} />
    </AccordionDropdown>
  )
}
