import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editPublisher } from '@/lib/publishers/actions'
import { fetchPublisherById } from '@/lib/publishers/data'
import type { Publisher } from '@/lib/publishers/schemas/db'
import { EmbeddedItemTypes } from '@/lib/schemas'
import type { PageEmbeddedItemProps } from '@/lib/types'
import { Loading } from '@/ui/loading'

const title = 'Edit Publisher'
export const metadata: Metadata = { title }

export default async function EditPublisherPage({
  params
}: PageEmbeddedItemProps) {
  const { id } = await params
  const publisher = await fetchPublisherById(id)

  if (!publisher) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditEmbeddedItemForm<Publisher>
          item={publisher}
          itemType={EmbeddedItemTypes.publishers}
          editItem={editPublisher}
        />
      </Suspense>
    </article>
  )
}
