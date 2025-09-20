import type { Metadata } from 'next'
import { Suspense } from 'react'

import type { EmbeddedItemType } from '@/lib/types'
import { deleteVenue, editVenue } from '@/lib/venues/actions'
import { fetchVenues } from '@/lib/venues/data'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'

const itemType: EmbeddedItemType = 'venues'
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function VenuesPage () {
  const venues = await fetchVenues()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <DashboardItems
          items={venues}
          itemType={itemType}
          editItem={editVenue}
          deleteItem={deleteVenue}
        />
      </Suspense>
    </DashboardLayout>
  )
}
