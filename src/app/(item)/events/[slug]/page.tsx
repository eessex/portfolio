import { Suspense } from 'react'

import { auth } from '@/api/auth'
import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams,
  type ItemLayoutProps
} from '@/app/(item)/item-layout'
import {
  fetchEventBySlug,
  fetchEvents
} from '@/lib/events/data'
import type { PagePathType } from '@/lib/types'
import { ItemsList } from '@/ui/items/items-list'
import { Loading } from '@/ui/loading'

const path: PagePathType = 'events'

export async function generateMetadata ({ params }: ItemLayoutProps) {
  return await generateItemMetadata(params, path, fetchEventBySlug)
}

export async function generateStaticParams () {
  return await generateItemStaticParams(fetchEvents)
}

export default async function EventsPage ({ params }: ItemLayoutProps) {
  const [{ slug }, session] = await Promise.all([
    params,
    auth()
  ])

  const { upcomingEvents } = await fetchEvents(!!session?.user)
  const moreEvents = upcomingEvents.filter(e => e.slug !== slug)

  return (
    <ItemLayout
      itemType={path}
      slug={slug}
      fetchFn={fetchEventBySlug}
    >
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
