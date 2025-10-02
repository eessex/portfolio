import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { auth } from '@/api/auth'
import ItemLayout, { formatItemMeta } from '@/app/(items)/item-layout'
import {
  fetchEventBySlug,
  fetchEvents
} from '@/lib/events/data'
import type { PageItemProps } from '@/lib/types'
import { ItemsList } from '@/ui/items/items-list'
import { Loading } from '@/ui/loading'

export async function generateMetadata ({ params }: PageItemProps) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  if (!slug || !event) return notFound()

  return formatItemMeta(event)
}

export async function generateStaticParams () {
  const items = await fetchEvents()
  return Object.values(items).flat().map(i => ({ slug: i.slug }))
}

export default async function EventsPage ({ params }: PageItemProps) {
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
