import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { auth } from '@/api/auth'
import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import {
  fetchEventBySlug,
  fetchEvents
} from '@/lib/events/data'
import type { PageItemProps } from '@/lib/types'
import { ItemsList } from '@/ui/items/items-list'
import { Loading } from '@/ui/loading'

export async function generateMetadata ({ params }: PageItemProps) {
  return generateItemMetadata(params, fetchEventBySlug)
}

export async function generateStaticParams () {
  return generateItemStaticParams(fetchEvents)
}

export default async function EventPage ({ params }: PageItemProps) {
  const [
    { slug },
    session
  ] = await Promise.all([
    params,
    auth()
  ])

  const [
    event,
    { upcomingEvents }
  ] = await Promise.all([
    fetchEventBySlug(slug, !!session?.user),
    fetchEvents(!!session?.user)
  ])
  if (!event) return notFound()

  const moreEvents = upcomingEvents.filter(e => e.id !== event.id)

  return (
    <ItemLayout item={event}>
      <Suspense fallback={<Loading />}>
        {moreEvents.length > 0 && (
          <ItemsList
            items={moreEvents}
            isTextOnly
            title='Upcoming Events'
          />
        )}
      </Suspense>
    </ItemLayout>
  )
}
