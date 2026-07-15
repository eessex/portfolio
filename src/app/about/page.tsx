import { Suspense } from 'react'

import styles from '@/app/about/about.module.scss'
import { auth } from '@/auth'
import { fetchAboutPage } from '@/lib/about/data'
import type { AboutContact } from '@/lib/about/types'
import { fetchPressImages } from '@/lib/images/cached'
import { fetchPressLinks } from '@/lib/links/cached'
import { fetchProjects } from '@/lib/projects/data'
import { fetchSiteSettings } from '@/lib/site-settings/data'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { ImageFigure } from '@/ui/images/image-figure'
import { ImageGrid } from '@/ui/images/image-grid'
import { ItemsList } from '@/ui/items/items-list'
import { LinksList } from '@/ui/links/link-list'

const title = 'About'

export async function generateMetadata() {
  const [settings, about] = await Promise.all([
    fetchSiteSettings(),
    fetchAboutPage()
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
    fetchAboutPage(),
    fetchPressLinks()
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
  const session = await auth()
  const {
    res: { allProjects }
  } = await fetchProjects(!!session?.user)

  if (!allProjects.length) return null

  return (
    <AccordionDropdown title='More Projects' isFullWidth>
      <ItemsList
        className={styles['projects-list']}
        items={allProjects}
        isCategoryVisible
      />
    </AccordionDropdown>
  )
}

/** Collapsible grid of press images, excluding the cover image. */
async function MoreImages() {
  const [about, pressImages] = await Promise.all([
    fetchAboutPage(),
    fetchPressImages()
  ])

  const filteredPressImages = pressImages.filter(
    (image) =>
      !!(
        image.isPress &&
        !image.isHiddenOnAboutPage &&
        image.id !== about?.coverImageId
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
  const links = await fetchPressLinks()

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
