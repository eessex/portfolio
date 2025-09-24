import type { Metadata } from 'next'
import { Suspense } from 'react'

import { auth } from '@/api/auth'
import { fetchEvents } from '@/lib/events/data'
import type { PagePathType } from '@/lib/types'
import { ItemsList } from '@/ui/items/items-list'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'

const path: PagePathType = 'events'

const title = camelToSentence(path)
export const metadata: Metadata = { title }

export default async function EventsPage () {
  const session = await auth()
  const {
    upcomingEvents,
    pastEvents
  } = await fetchEvents(!!session?.user)

  return (
    <div>
      <h1 className='visually-hidden'>
        {title}
      </h1>

      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <ItemsList
          items={upcomingEvents}
          isFeatured
          title={camelToSentence('upcomingEvents')}
        />
        <ItemsTable
          path={path}
          items={[{
            pastEvents,
            upcomingEvents: []
          }]}
        />
      </Suspense>
    </div>
  )
}
