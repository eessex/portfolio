import type { Metadata } from 'next'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'

const title = 'New Embed Code'
export const metadata: Metadata = { title }

export default function NewEmbedCodePage () {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEmbeddedItemForm itemType='embedCodes' />
    </article>
  )
}
