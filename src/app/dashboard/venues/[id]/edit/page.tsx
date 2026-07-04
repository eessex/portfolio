import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import type { PageEmbeddedItemProps } from '@/lib/types'
import { editVenue } from '@/lib/venues/actions'
import { fetchVenueById } from '@/lib/venues/data'
import type { Venue } from '@/lib/venues/schemas/db'
import { Loading } from '@/ui/loading'

const title = 'Edit Venue'

export const metadata: Metadata = { title }

export default async function EditVenuePage({
  params
}: PageEmbeddedItemProps) {
  const { id } = await params
  const venue = await fetchVenueById(id)

  if (!venue) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditEmbeddedItemForm<Venue>
          item={venue}
          itemType='venues'
          editItem={editVenue}
        />
      </Suspense>
    </article>
  )
}
