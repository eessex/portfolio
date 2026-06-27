import styles from '@/app/about/about.module.scss'
import { fetchAboutPage } from '@/lib/about/data'
import { fetchSiteSettings } from '@/lib/site-settings/data'
import { EditAboutForm } from '@/ui/form/edit-about'

const title = 'Edit: About'

export async function generateMetadata() {
  const about = await fetchAboutPage()
  const settings = await fetchSiteSettings()
  const image = (about || settings)?.coverImage
  const images = image
    ? [
        {
          url: image.url,
          width: 1200,
          height: 1200 * image.aspect,
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
  const about = await fetchAboutPage()

  return (
    <article className={`${styles.about} px-4 pt-4 pb-8`}>
      <header>
        <h1 className='py-2'>{title}</h1>
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
