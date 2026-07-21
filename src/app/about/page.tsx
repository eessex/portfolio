import { Suspense } from 'react'

import styles from '@/app/about/about.module.scss'
import { fetchCachedAboutPage } from '@/lib/about/cached'
import type { AboutContact } from '@/lib/about/types'
import { fetchCachedPressImagesFirstPage } from '@/lib/images/cached'
import { fetchCachedPressLinks } from '@/lib/links/cached'
import { fetchProjects } from '@/lib/projects/data'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { ImageFigure } from '@/ui/images/image-figure'
import { ImageGrid } from '@/ui/images/image-grid'
import { LinksList } from '@/ui/links/link-list'
import { MoreProjectsList } from '@/ui/projects/more-projects-list'

const title = 'About'

export async function generateMetadata() {
  const [settings, about] = await Promise.all([
    fetchCachedSiteSettings(),
    fetchCachedAboutPage()
  ])

  const image = (about || settings)?.coverImage
  const images = image
    ? [
        {
          url: image.url,
          width: 1200,
          height: Math.round(1200 * image.aspect),
          alt: image.caption
        }
      ]
    : []

  return {
    title,
    description: settings?.description,
    openGraph: { images }
  }
}

export default function AboutPage() {
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

/** Collapsible list of related projects. */
async function MoreProjects() {
  const {
    res: { allProjects }
  } = await fetchProjects(false)

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
