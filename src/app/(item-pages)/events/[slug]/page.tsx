import { redirect } from 'next/navigation'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { isAuthed } from '@/lib/auth/guard'
import {
  fetchCachedEventById,
  fetchCachedUpcomingEvents
} from '@/lib/events/cached'
import { fetchEventsRaw } from '@/lib/events/data'
import type { EventClient } from '@/lib/events/types'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
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
  const resolved = await resolveSlug(PagePaths.events, slug)

  if (!resolved) {
    redirect(`/${PagePaths.events}`)
  }

  if (resolved.isRedirect) {
    redirect(`/${PagePaths.events}/${resolved.slug}`)
  }

  const event = await fetchCachedEventById(resolved.id, false)

  if (event) {
    return <EventDetail event={event} isAuthed={false} />
  }

  const authed = await isAuthed()
  const draft = await fetchCachedEventById(resolved.id, authed)

  if (!draft) {
    redirect(`/${PagePaths.events}`)
  }

  return <EventDetail event={draft} isAuthed={authed} />
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
