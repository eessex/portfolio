import type { Metadata } from 'next'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editLink } from '@/lib/links/actions'
import type { Link } from '@/lib/links/types'

const title = 'New Link'
export const metadata: Metadata = { title }

export default function NewLinkPage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEmbeddedItemForm<Link>
        itemType='links'
        editItem={editLink}
      />
    </article>
  )
}
