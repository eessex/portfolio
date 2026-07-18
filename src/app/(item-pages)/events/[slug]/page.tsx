import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedEventById } from '@/lib/events/cached'
import { fetchEvents, fetchEventsRaw } from '@/lib/events/data'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'
import { ItemsList } from '@/ui/items/items-list'
import { Loading } from '@/ui/loading'
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
  const [{ slug }, authed] = await Promise.all([params, isAuthed()])
  const resolved = await resolveSlug(PagePaths.events, slug)

  if (!resolved) {
    redirect(`/${PagePaths.events}`)
  }

  if (resolved.isRedirect) {
    redirect(`/${PagePaths.events}/${resolved.slug}`)
  }

  const [
    event,
    {
      res: { upcomingEvents }
    }
  ] = await Promise.all([
    fetchCachedEventById(resolved.id, authed),
    fetchEvents(authed)
  ])

  if (!event) {
    redirect(`/${PagePaths.events}`)
  }

  const moreEvents = upcomingEvents.filter((e) => e.id !== event.id)

  return (
    <ItemLayout item={event}>
      <Suspense fallback={<Loading />}>
        {moreEvents.length > 0 && (
          <ItemsList
            items={moreEvents}
            isTextOnly
            title={formattedItemType(event.path, true, true)}
          />
        )}
      </Suspense>
    </ItemLayout>
  )
}
