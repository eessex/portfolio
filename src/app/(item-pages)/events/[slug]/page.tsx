import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { resolvePageItem } from '@/app/(item-pages)/resolve-page-item'
import {
  fetchCachedEventById,
  fetchCachedUpcomingEvents
} from '@/lib/events/cached'
import { fetchEventsRaw } from '@/lib/events/data'
import type { EventClient } from '@/lib/events/types'
import { PagePaths } from '@/lib/schemas'
import type { PageItemProps } from '@/lib/types'
import { UpcomingEventsList } from '@/ui/events/upcoming-events-list'
import { formattedItemType } from '@/ui/util'

export async function generateMetadata({ params }: PageItemProps) {
  return generateItemMetadata(
    params,
    PagePaths.events,
    fetchCachedEventById
  )
}

export async function generateStaticParams() {
  return generateItemStaticParams(fetchEventsRaw)
}

export default async function EventPage({ params }: PageItemProps) {
  const { slug } = await params
  const { item, isAuthed } = await resolvePageItem(
    PagePaths.events,
    slug,
    fetchCachedEventById
  )

  return <EventDetail event={item} isAuthed={isAuthed} />
}

async function EventDetail({
  event,
  isAuthed: authed
}: {
  event: EventClient
  isAuthed: boolean
}) {
  const upcomingEvents = await fetchCachedUpcomingEvents(authed)

  return (
    <ItemLayout item={event}>
      <UpcomingEventsList
        initialEvents={upcomingEvents}
        excludeId={event.id}
        isTextOnly
        title={formattedItemType(event.path, true, true)}
      />
    </ItemLayout>
  )
}
