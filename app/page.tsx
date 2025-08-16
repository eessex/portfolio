import styles from '@/home.module.scss'
import { fetchEvents, fetchSiteSettings } from '@/lib/data'
import EventsGrid from '@/ui/events-grid/events-grid'
import Loading from '@/ui/loading'
import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '../auth'

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
    <div>
      <section className={styles.cover}>
        <h1 className='visually-hidden'>
          Homepage
        </h1>

        {settings?.coverImage && (
          <figure style={{ aspectRatio: settings.coverImage.aspect }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.coverImage.url}
              alt={settings.coverImage.caption}
              title={settings.coverImage.caption}
              style={{ aspectRatio: settings.coverImage.aspect }}
              className='cover-img'
            />
          </figure>
        )}

        {settings?.description && (
          <Link href='/about' className={'button ' + styles.description}>{settings.description}</Link>
        )}
      </section>

      <Suspense fallback={<Loading />}>
        {upcomingEvents.length > 0 &&
        (
          <div className='pt-4'>
            <EventsGrid events={upcomingEvents} isUpcoming isTextOnly />
          </div>
        )}
      </Suspense>
    </div>
  )
}
