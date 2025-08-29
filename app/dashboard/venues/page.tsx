import { deleteVenue, editVenue } from '@/lib/actions/venues'
import { fetchVenues } from '@/lib/data/venues'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Venues'
export const metadata: Metadata = { title }

export default async function VenuesPage () {
  const venues = await fetchVenues()

  return (
    <DashboardLayout title={title} itemType='venue'>
      <Suspense fallback={<Loading />}>
        <DashboardItems
          items={venues}
          itemType='venue'
          editItem={editVenue}
          deleteItem={deleteVenue}
        />
      </Suspense>
    </DashboardLayout>
  )
}
