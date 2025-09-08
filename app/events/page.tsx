import { fetchEvents } from '@/lib/events/data'
import type { EventClient, FetchEventsResult } from '@/lib/events/types'
import { ItemsIndex } from '@/ui/items/items-index'
import { Loading } from '@/ui/loading'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '../../auth'

const title = 'Events'
export const metadata: Metadata = { title }

export default async function EventsPage () {
  const session = await auth()
  const items = await fetchEvents(!!session?.user)

  return (
    <div>
      <h1 className='visually-hidden'>
        {title}
      </h1>

      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <ItemsIndex<EventClient, FetchEventsResult>
          pageType='event'
          items={items}
        />
      </Suspense>
    </div>
  )
}
