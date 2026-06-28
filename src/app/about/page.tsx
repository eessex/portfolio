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
import { Loading } from '@/ui/loading'

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

export default async function AboutPage() {
  const [about, links, pressImages, session] = await Promise.all([
    fetchAboutPage(),
    fetchPressLinks(),
    fetchPressImages(),
    auth()
  ])

  const {
    res: { allProjects }
  } = await fetchProjects(!!session?.user)

  const [pressLinksWithQuotes, pressLinksWithoutQuotes] =
    links.reduce(
      ([withQuotes, withoutQuotes], link) =>
        link.quotation
          ? [[...withQuotes, link], withoutQuotes]
          : [withQuotes, [...withoutQuotes, link]],
      [[], []] as [typeof links, typeof links]
    )

  const filteredPressImages = pressImages.filter(
    (image) =>
      !!(
        image.isPress &&
        !image.isHiddenOnAboutPage &&
        image.id !== about?.coverImageId
      )
  )

  return (
    <article className={styles.about}>
      <header>
        <h1>{title}</h1>
      </header>

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
          <p style={{ whiteSpace: 'pre-line' }}>
            {about.description}
          </p>
        )}

        {about?.contactInfo?.map(
          ({ title, contact }: AboutContact, i) => (
            <p key={i}>
              {title && <b>{title}: </b>}
              {contact}
            </p>
          )
        )}
        <Suspense>
          <LinksList
            className={styles['links-list']}
            links={pressLinksWithQuotes}
            isPress
          />
        </Suspense>
      </section>

      <div className={styles['press-info']}>
        <Suspense fallback={<Loading />}>
          {!!allProjects.length && (
            <AccordionDropdown title='More Projects' isFullWidth>
              <ItemsList
                className={styles['projects-list']}
                items={allProjects}
                isCategoryVisible
              />
            </AccordionDropdown>
          )}
        </Suspense>

        <Suspense fallback={<Loading />}>
          {!!filteredPressImages.length && (
            <AccordionDropdown title='More Images' isFullWidth>
              <ImageGrid images={filteredPressImages} />
            </AccordionDropdown>
          )}
        </Suspense>

        <Suspense>
          {!!pressLinksWithoutQuotes.length && (
            <AccordionDropdown title='More Press' isFullWidth>
              <LinksList links={pressLinksWithoutQuotes} />
            </AccordionDropdown>
          )}
        </Suspense>
      </div>
    </article>
  )
}
