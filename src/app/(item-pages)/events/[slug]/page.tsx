import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { auth } from '@/auth'
import {
  fetchCachedEventById,
  fetchCachedEventBySlug
} from '@/lib/events/cached'
import { fetchEvents, fetchEventsRaw } from '@/lib/events/data'
import { path } from '@/lib/projects/data'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'
import { ItemsList } from '@/ui/items/items-list'
import { Loading } from '@/ui/loading'
import { formattedItemType } from '@/ui/util'

export async function generateMetadata({ params }: PageItemProps) {
  return generateItemMetadata(params, fetchCachedEventBySlug)
}

export async function generateStaticParams() {
  return generateItemStaticParams(fetchEventsRaw)
}

export default async function EventPage({ params }: PageItemProps) {
  const [{ slug }, session] = await Promise.all([params, auth()])
  const resolved = await resolveSlug(path, slug)

  if (!resolved) {
    redirect(`/${path}`)
  }

  if (resolved.isRedirect) {
    redirect(`/${path}/${resolved.slug}`)
  }

  const [
    event,
    {
      res: { upcomingEvents }
    }
  ] = await Promise.all([
    fetchCachedEventById(resolved.id, !!session?.user),
    fetchEvents(!!session?.user)
  ])

  if (!event) {
    redirect(`/${path}`)
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
