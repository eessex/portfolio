import type { Metadata } from 'next'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editPublisher } from '@/lib/publishers/actions'
import type { Publisher } from '@/lib/publishers/schemas/db'
import { EmbeddedItemTypes } from '@/lib/schemas'

const title = 'New Publisher'
export const metadata: Metadata = { title }

export default function NewPublisherPage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEmbeddedItemForm<Publisher>
        itemType={EmbeddedItemTypes.publishers}
        editItem={editPublisher}
      />
    </article>
  )
}
