import type { Metadata } from 'next'
import { Suspense } from 'react'

import { auth } from '@/auth'
import { fetchEvents } from '@/lib/events/data'
import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsList } from '@/ui/items/items-list'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'
import { formattedItemType } from '@/ui/util'

const path = PagePaths.events
const description = 'Upcoming and past live performances.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default async function EventsPage() {
  const session = await auth()
  const events = await fetchEvents(!!session?.user)

  return (
    <div>
      <h1 className='visually-hidden'>{title}</h1>

      <Suspense fallback={<Loading />}>
        <ItemsList
          items={events.res.upcomingEvents}
          isFeatured
          title={formattedItemType(path, true, true)}
        />
        <ItemsTable<EventClient, FetchEventsResult>
          path={path}
          initialItems={events}
          omitKeys={['upcomingEvents']}
        />
      </Suspense>
    </div>
  )
}
