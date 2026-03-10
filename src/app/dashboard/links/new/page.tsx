import type { Metadata } from 'next'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'

const title = 'New Link'
export const metadata: Metadata = { title }

export default function NewLinkPage () {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEmbeddedItemForm itemType='links' />
    </article>
  )
}
