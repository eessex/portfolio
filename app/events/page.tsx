import { fetchEvents } from '@/lib/data'
import EventsGrid from '@/ui/events-grid/events-grid'
import EventsList from '@/ui/events-list/events-list'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Events'
export const metadata: Metadata = { title }

export default async function EventsPage () {
  const { upcomingEvents, pastEvents } = await fetchEvents()

  return (
    <div>
      <h1 className='p-4 md:2 visually-hidden'>
        {title}
      </h1>

      <Suspense fallback={<p className='p-4 md:2'>Loading...</p>}>
        <EventsGrid events={upcomingEvents} isUpcoming isColumn />
        <EventsList events={pastEvents} />
      </Suspense>
    </div>
  )
}
