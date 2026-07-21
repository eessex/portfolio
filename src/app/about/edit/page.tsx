import styles from '@/app/about/about.module.scss'
import { fetchCachedAboutPage } from '@/lib/about/cached'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { EditAboutForm } from '@/ui/form/edit-about'

const title = 'Edit: About'

export async function generateMetadata() {
  const about = await fetchCachedAboutPage()
  const settings = await fetchCachedSiteSettings()
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
  const about = await fetchCachedAboutPage()

  return (
    <article className={styles.about}>
      <header>
        <h1>{title}</h1>
      </header>

      {about && (
        <section>
          <EditAboutForm
            about={{
              ...about,
              coverImageId: about.coverImageId,
              coverImage: about.coverImage
            }}
          />
        </section>
      )}
    </article>
  )
}
