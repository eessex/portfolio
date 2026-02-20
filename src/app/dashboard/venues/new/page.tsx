import type { Metadata } from 'next'
import { Suspense } from 'react'

import { NewVenueForm } from '@/app/dashboard/venues/new/new-venue-form'

const title = 'New Venue'
export const metadata: Metadata = { title }

export default function NewVenuePage () {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense>
        <NewVenueForm />
      </Suspense>
    </article>
  )
}
