import { fetchEvents } from '@/lib/data'
import EventsGrid from '@/ui/events-grid/events-grid'
import EventsList from '@/ui/events-list/events-list'
import Loading from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '../../auth'

const title = 'Events'
export const metadata: Metadata = { title }

export default async function EventsPage () {
  const session = await auth()
  const { upcomingEvents, pastEvents } = await fetchEvents(!!session?.user)

  return (
    <div>
      <h1 className='p-4 visually-hidden'>
        {title}
      </h1>

      <Suspense fallback={<Loading />}>
        <div className='flex flex-col space-y-8'>
          {upcomingEvents.length > 0 && <EventsGrid events={upcomingEvents} isUpcoming isColumn />}
          <EventsList events={pastEvents} />
        </div>
      </Suspense>
    </div>
  )
}
