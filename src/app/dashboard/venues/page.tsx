import type { Metadata } from 'next'
import { Suspense } from 'react'

import { EmbeddedItemTypes } from '@/lib/schemas'
import { camelToSentence } from '@/lib/strings'
import { fetchVenues } from '@/lib/venues/data'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'

const itemType = EmbeddedItemTypes.venues
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function VenuesPage() {
  const res = await fetchVenues()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <ItemsTable itemType={itemType} initialItems={res} />
      </Suspense>
    </DashboardLayout>
  )
}
