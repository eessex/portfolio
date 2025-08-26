import { fetchVenues } from '@/lib/data/venues'
import Loading from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Dashboard } from '@/ui/dashboard/dashboard'
import { deleteVenue, editVenue } from '@/lib/actions/venues'

const title = 'Dashboard: Venues'
export const metadata: Metadata = { title }

export default async function VenuesPage () {
  const venues = await fetchVenues()

  return (
    <div>
      <h1 className='p-4'>
        {title}
      </h1>

      <div className='p-4'>
        <Suspense fallback={<Loading />}>
          <Dashboard
            itemType='venue'
            items={venues}
            editItem={editVenue}
            deleteItem={deleteVenue}
          />
        </Suspense>
      </div>
    </div>
  )
}
