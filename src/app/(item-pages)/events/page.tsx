import type { Metadata } from 'next'

import ListLayout from '@/app/(item-pages)/list-layout'
import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { formattedItemType } from '@/ui/util'

const path = PagePaths.events
const description = 'Upcoming and past live performances.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default async function EventsPage() {
  return (
    <ListLayout title={title}>
      <EventsList />
    </ListLayout>
  )
}

async function EventsList() {
  const events = await fetchCachedEventsFirstPage(false)

  return (
    <ItemsTable<EventClient, FetchEventsResult>
      itemType={path}
      initialItems={events}
      featuredKey='upcomingEvents'
    />
  )
}
