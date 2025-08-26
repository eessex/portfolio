'use client'

import { deleteVenue, editVenue } from '@/lib/actions/venues'
import { type Venue as _Venue } from '@/lib/definitions'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { Dialog } from '@/ui/dialog/dialog'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { Form } from '@/ui/form/form'
import { eventUrl } from '@/ui/util'
import { EditVenue } from '@/ui/venues/edit-venue-form'
import { VenueInline } from '@/ui/venues/venue'
import styles from '@/ui/venues/venues.module.scss'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { Dashboard } from '../dashboard/dashboard'

type SavedVenue = _Venue & { id: string }

export function VenuesDashboard ({ venues }: { venues: _Venue[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [venueToEdit, setVenueToEdit] = useState<_Venue | undefined>(undefined)

  return (
    <div>
      <Dashboard
        itemType='venue'
        items={venues}
        editItem={editVenue}
        deleteItem={deleteVenue}
      />

    </div>
  )
}
