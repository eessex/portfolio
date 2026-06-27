import type { Metadata } from 'next'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editEmbedCode } from '@/lib/embed-codes/actions'
import type { EmbedCode } from '@/lib/embed-codes/types'

const title = 'New Embed Code'
export const metadata: Metadata = { title }

export default function NewEmbedCodePage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEmbeddedItemForm<EmbedCode>
        itemType='embedCodes'
        editItem={editEmbedCode}
      />
    </article>
  )
}
