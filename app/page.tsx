import { fetchEvents } from '@/lib/data'
import EventsGrid from '@/ui/events-grid/events-grid'
import { Suspense } from 'react'

const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Site Description'

export default async function Home () {
  const events = await fetchEvents()

  return (
    <div className='p-4 md:2'>
      <section>
        <h1 className='visually-hidden'>
          Homepage
        </h1>

        {siteDescription && (
          <h2>{siteDescription}</h2>
        )}
      </section>

      <Suspense fallback={<p>Loading...</p>}>
        <EventsGrid events={events} />
      </Suspense>
    </div>
  )
}
