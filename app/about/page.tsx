import styles from '@/about/about.module.scss'
import { fetchAboutPage, fetchPressImages, fetchPressLinks, fetchSiteSettings } from '@/lib/data'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { ImageGrid } from '@/ui/image-grid/image-grid'
import Loading from '@/ui/loading'
import { Suspense } from 'react'
import { FigureImage } from '@/ui/image-grid/image-figure'
import { LinksList } from '@/ui/links/link-list'

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

  return (
    <article className={styles.about}>
      <header>
        <h1>{title}</h1>
      </header>

      <section>

        {about?.coverImageId && about.coverImage && (
          <FigureImage image={{ ...about.coverImage, id: about.coverImageId }} className={styles['cover-image']} />
        )}

        {about?.description && (
          <p style={{ whiteSpace: 'pre-line' }}>
            {about.description}
          </p>
        )}

        {/* FIXME: rename/add contact column */}
        {about?.title && (
          <p><b>{about.title}</b></p>
        )}
        <LinksList links={pressLinksWithQuotes} />

      </section>

      <div className={styles['press-info']}>
        <Suspense fallback={<Loading />}>
          <AccordionDropdown title='More Images'>
            <ImageGrid images={pressImages.filter(i => i.url !== about?.coverImage?.url)} />
          </AccordionDropdown>
        </Suspense>

        {!!pressLinksWithoutQuotes.length && (
          <AccordionDropdown title='More Press'>
            <LinksList links={pressLinksWithoutQuotes} />
          </AccordionDropdown>
        )}
      </div>
    </article>
  )
}
