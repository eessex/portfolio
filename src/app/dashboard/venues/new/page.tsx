import type { Metadata } from 'next'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editVenue } from '@/lib/venues/actions'
import type { Venue } from '@/lib/venues/types'

const title = 'New Venue'
export const metadata: Metadata = { title }

export default function NewVenuePage () {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEmbeddedItemForm<Venue>
        itemType='venues'
        editItem={editVenue}
      />
    </article>
  )
}
