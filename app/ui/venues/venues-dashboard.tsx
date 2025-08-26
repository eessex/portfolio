'use client'

import { deleteVenue, editVenue } from '@/lib/actions/venues'
import { type Venue } from '@/lib/definitions'
import { Dashboard } from '@/ui/dashboard/dashboard'

type SavedVenue = Venue & { id: string }

export function VenuesDashboard ({ venues }: { venues: SavedVenue[] }) {
  return (
    <Dashboard
      itemType='venue'
      items={venues}
      editItem={editVenue}
      deleteItem={deleteVenue}
    />
  )
}
