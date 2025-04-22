import { fetchAboutPage, fetchPressImages, fetchPressLinks, fetchSiteSettings } from '@/lib/data'
import AccordionDropdown from '@/ui/accordion-dropdown/accordion-dropdown'
import styles from '@/about/about.module.scss'
import ImageGrid from '@/ui/image-grid/image-grid'
import { Suspense } from 'react'
import Loading from '@/ui/loading'
import { formattedDateTime } from '@/ui/util'

const title = 'About'

export async function generateMetadata () {
  const about = await fetchAboutPage()
  const settings = await fetchSiteSettings()
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
  const about = await fetchAboutPage()
  const pressImages = await fetchPressImages()
  const links = await fetchPressLinks()

  return (
    <article className={`${styles.about} px-4`}>
      <header>
        <h1 className='py-2'>{title}</h1>
      </header>

      {about?.coverImage && (
        <figure className={styles['cover-image']}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={about.coverImage.url}
            alt={about.coverImage.caption}
            title={about.coverImage.caption}
            style={{ aspectRatio: about.coverImage.aspect }}
            className='cover-img'
          />
          {about.coverImage.caption && (
            <figcaption>{about.coverImage.caption}</figcaption>
          )}
        </figure>
      )}

      <section>
        {about?.description && (
          <p>{about.description}</p>
        )}

        {/* FIXME: rename/add contact column */}
        {about?.title && (
          <p><b>{about.title}</b></p>
        )}
      </section>

      <div className={styles['press-info']}>
        <Suspense fallback={<Loading />}>
          <AccordionDropdown title='Press Images'>
            <ImageGrid images={pressImages.filter(i => i.url !== about?.coverImage.url)} />
          </AccordionDropdown>
        </Suspense>

        {!!links.length && (
          <AccordionDropdown title='Press Links'>
            <ul>
              {links?.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target='_blank' rel='noopener noreferrer'>
                    <div>
                      <b>{link.title || link.url}</b>
                      <div>
                        {link.attribution && (<em>— {link.attribution}, </em>)}
                        {formattedDateTime(link.publishedDate || link.createdAt!, 'xs')}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </AccordionDropdown>
        )}
      </div>
    </article>
  )
}
