import type { Metadata } from 'next'
import { Suspense } from 'react'

import type { EmbeddedItemType } from '@/lib/types'
import {
  deleteVenue,
  editVenue
} from '@/lib/venues/actions'
import {
  fetchSimilarVenue,
  fetchVenues
} from '@/lib/venues/data'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'

const itemType: EmbeddedItemType = 'venues'
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function VenuesPage () {
  const res = await fetchVenues()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <DashboardItems
          apiEndpoint='/api/venues'
          res={res}
          itemType={itemType}
          editItem={editVenue}
          deleteItem={deleteVenue}
          fetchMaybeExistingItem={fetchSimilarVenue}
        />
      </Suspense>
    </DashboardLayout>
  )
}
