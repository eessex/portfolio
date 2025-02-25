import { fetchEvents } from '@/lib/data'
import EventsGrid from '@/ui/events-grid/events-grid'
import { Suspense } from 'react'
import styles from '@/home.module.scss'

const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Eve Essex is a composer, songwriter and multi-instrumentalist based in New York City.'
// TODO: pull from DB
const siteImage = process.env.NEXT_PUBLIC_SITE_IMAGE_LG

export default async function Home () {
  const events = await fetchEvents()

  return (
    <div>
      <section className={styles.cover}>
        <h1 className='visually-hidden'>
          Homepage
        </h1>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={siteImage} alt='' className='cover-img' />

        {siteDescription && (
          <h2 className='p-6'>{siteDescription}</h2>
        )}
      </section>

      <Suspense fallback={<p>Loading...</p>}>
        <EventsGrid events={events} />
      </Suspense>
    </div>
  )
}
