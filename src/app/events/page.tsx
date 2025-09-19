import { fetchEvents } from '@/lib/events/data'
import type { EventClient, FetchEventsResult } from '@/lib/events/types'
import type { PagePathType } from '@/lib/types'
import { ItemsIndex } from '@/ui/items/items-index'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/api/auth/auth'

const path: PagePathType = 'events'

const title = camelToSentence(path)
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
          pageType={path}
          items={items}
        />
      </Suspense>
    </div>
  )
}
