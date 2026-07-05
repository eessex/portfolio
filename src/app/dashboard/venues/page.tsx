import type { Metadata } from 'next'
import { Suspense } from 'react'

import { EmbeddedItemTypes } from '@/lib/schemas'
import { camelToSentence } from '@/lib/strings'
import { deleteVenue } from '@/lib/venues/actions'
import { fetchVenues } from '@/lib/venues/data'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'

const itemType = EmbeddedItemTypes.venues
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function VenuesPage() {
  const res = await fetchVenues()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <DashboardItems
          apiEndpoint='/api/venues'
          res={res}
          itemType={itemType}
          deleteItem={deleteVenue}
        />
      </Suspense>
    </DashboardLayout>
  )
}
