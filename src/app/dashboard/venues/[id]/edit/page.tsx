import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import type { PageEmbeddedItemProps } from '@/lib/types'
import { fetchVenueById } from '@/lib/venues/data'
import { Loading } from '@/ui/loading'

const title = 'Edit Venue'

export const metadata: Metadata = { title }

export default async function EditVenuePage ({ params }: PageEmbeddedItemProps) {
  const { id } = await params
  const venue = await fetchVenueById(id)

  if (!venue) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditEmbeddedItemForm
          item={venue}
          itemType='venues'
        />
      </Suspense>
    </article>
  )
}
