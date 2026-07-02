import type { Metadata } from 'next'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editImage } from '@/lib/images/actions'
import type { Image } from '@/lib/images/types'
import { EmbeddedItemTypes } from '@/lib/schemas'

const title = 'New Image'
export const metadata: Metadata = { title }

export default function NewImagePage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEmbeddedItemForm<Image>
        itemType={EmbeddedItemTypes.images}
        editItem={editImage}
      />
    </article>
  )
}
