import styles from '@/home.module.scss'
import { fetchEvents } from '@/lib/data'
import EventsGrid from '@/ui/events-grid/events-grid'
import Loading from '@/ui/loading'
import Link from 'next/link'
import { Suspense } from 'react'

// TODO: pull from DB
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Eve Essex is a composer, songwriter and multi-instrumentalist based in New York City.'
const siteImage = process.env.NEXT_PUBLIC_SITE_IMAGE_LG
const siteImageAlt = process.env.NEXT_PUBLIC_SITE_IMAGE_LG_ALT || 'Photo by Alice Plati'

export default async function Home () {
  const { upcomingEvents } = await fetchEvents()

  return (
    <div>
      <section className={styles.cover}>
        <h1 className='visually-hidden'>
          Homepage
        </h1>

        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={siteImage} alt={siteImageAlt} title={siteImageAlt} className='cover-img' />
        </figure>

        {siteDescription && (
          <h2 className='p-6'>
            <Link href='/about'>{siteDescription}</Link>
          </h2>
        )}
      </section>

      <Suspense fallback={<Loading />}>
        <EventsGrid events={upcomingEvents} isUpcoming isTextOnly />
      </Suspense>
    </div>
  )
}
