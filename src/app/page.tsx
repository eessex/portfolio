import styles from '@/app/home.module.scss'
import { fetchEvents } from '@/lib/events/data'
import { fetchSiteSettings } from '@/lib/site-settings/data'
import { EventsGrid } from '@/ui/events-grid/events-grid'
import { Loading } from '@/ui/loading'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { Suspense } from 'react'
import { auth } from '../../auth'

export async function generateMetadata () {
  const settings = await fetchSiteSettings()
  const images = settings?.coverImage
    ? [{
        url: settings?.coverImage.url,
        width: 1200,
        height: 1200 * settings?.coverImage.aspect,
        alt: settings?.coverImage.caption,
      }]
    : []

  return {
    title: settings?.title,
    description: settings?.description,
    openGraph: { images }
  }
}

export default async function Home () {
  const settings = await fetchSiteSettings()
  const session = await auth()
  const { upcomingEvents } = await fetchEvents(!!session?.user)

  return (
    <div className={styles.home}>
      <section className={styles.cover}>
        <h1 className='visually-hidden'>
          Homepage
        </h1>

        {settings?.coverImage && (
          <figure style={{ aspectRatio: settings.coverImage.aspect }}>
            <NextImage
              src={settings.coverImage.url}
              alt={settings.coverImage.alt || settings.coverImage.caption || ''}
              title={settings.coverImage.caption || settings.coverImage.alt || undefined}
              width={800 * settings.coverImage.aspect}
              height={800}
              priority
            />
          </figure>
        )}

        {settings?.description && (
          <NextLink href='/about' className={'button ' + styles.description}>{settings.description}</NextLink>
        )}
      </section>

      <Suspense fallback={<Loading />}>
        {upcomingEvents.length > 0 &&
        (
          <EventsGrid events={upcomingEvents} isUpcoming isTextOnly />
        )}
      </Suspense>
    </div>
  )
}
