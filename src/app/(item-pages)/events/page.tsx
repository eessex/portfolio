import type { Metadata } from 'next'

import ListLayout from '@/app/(item-pages)/list-layout'
import { isAuthed } from '@/lib/auth/guard'
import { fetchEvents } from '@/lib/events/data'
import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsList } from '@/ui/items/items-list'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { formattedItemType } from '@/ui/util'

const path = PagePaths.events
const description = 'Upcoming and past live performances.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default function EventsPage() {
  return (
    <ListLayout title={title}>
      <EventsList />
    </ListLayout>
  )
}

async function EventsList() {
  const events = await fetchEvents(await isAuthed())

  return (
    <>
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
    </>
  )
}
