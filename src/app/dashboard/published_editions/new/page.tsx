import type { Metadata } from 'next'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editPublishedEdition } from '@/lib/published-editions/actions'
import type { PublishedEdition } from '@/lib/published-editions/schemas/db'

const title = 'New Published Edition'
export const metadata: Metadata = { title }

export default function NewPublishedEditionPage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEmbeddedItemForm<PublishedEdition>
        itemType='publishedEditions'
        editItem={editPublishedEdition}
      />
    </article>
  )
}
