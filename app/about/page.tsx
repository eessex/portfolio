import styles from '@/about/about.module.scss'
import { fetchAboutPage, fetchSiteSettings } from '@/lib/data'
import { fetchPressLinks } from '@/lib/data/links'
import type { AboutContact } from '@/lib/definitions'
import { fetchPressImages } from '@/lib/images/data'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { FigureImage } from '@/ui/images/image-figure'
import { ImageGrid } from '@/ui/images/image-grid'
import { LinksList } from '@/ui/links/link-list'
import { Loading } from '@/ui/loading'
import { Suspense } from 'react'

const title = 'About'

export async function generateMetadata () {
  const [settings, about] = await Promise.all([
    fetchSiteSettings(),
    fetchAboutPage()
  ])

  const image = (about || settings)?.coverImage
  const images = image
    ? [{
        url: image.url,
        width: 1200,
        height: 1200 * image.aspect,
        alt: image.caption,
      }]
    : []

  return {
    title,
    description: settings?.description,
    openGraph: { images }
  }
}

export default async function AboutPage () {
  const [about, pressImages, links] = await Promise.all([
    fetchAboutPage(),
    fetchPressImages(),
    fetchPressLinks()
  ])

  const [pressLinksWithQuotes, pressLinksWithoutQuotes] = links.reduce(
    ([withQuotes, withoutQuotes], link) =>
      link.quotation
        ? [[...withQuotes, link], withoutQuotes]
        : [withQuotes, [...withoutQuotes, link]],
    [[], []] as [typeof links, typeof links]
  )

  const filteredPressImages = pressImages.filter(image => !!(image.isPress && !image.isHiddenOnAboutPage && image.id !== about?.coverImageId))

  return (
    <article className={styles.about}>
      <header>
        <h1>{title}</h1>
      </header>

      <section>
        {about?.coverImageId && about.coverImage && (
          <FigureImage
            image={{ ...about.coverImage, id: about.coverImageId }}
            className={styles['cover-image']}
          />
        )}

        {about?.description && (
          <p style={{ whiteSpace: 'pre-line' }}>
            {about.description}
          </p>
        )}

        {about?.contactInfo?.map(({ title, contact }: AboutContact, i) => (
          <p key={i}>{title && <b>{title}: </b>}{contact}</p>
        ))}
        <Suspense>
          <LinksList links={pressLinksWithQuotes} />
        </Suspense>
      </section>

      <div className={styles['press-info']}>
        <Suspense fallback={<Loading />}>
          {!!filteredPressImages.length && (
            <AccordionDropdown title='More Images'>
              <ImageGrid images={filteredPressImages} />
            </AccordionDropdown>
          )}
        </Suspense>

        <Suspense>
          {!!pressLinksWithoutQuotes.length && (
            <AccordionDropdown title='More Press'>
              <LinksList links={pressLinksWithoutQuotes} />
            </AccordionDropdown>
          )}
        </Suspense>
      </div>
    </article>
  )
}
