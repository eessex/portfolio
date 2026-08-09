import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import {
  deletePublishedEdition,
  editPublishedEdition
} from '@/lib/published-editions/actions'
import { fetchPublishedEditionById } from '@/lib/published-editions/data'
import type { PublishedEdition } from '@/lib/published-editions/schemas/db'
import type { PageEmbeddedItemProps } from '@/lib/types'
import { Loading } from '@/ui/loading'

const title = 'Edit Published Edition'

export const metadata: Metadata = { title }

export default async function EditPublishedEditionPage({
  params
}: PageEmbeddedItemProps) {
  const { id } = await params
  const edition = await fetchPublishedEditionById(id)

  if (!edition) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditEmbeddedItemForm<PublishedEdition>
          item={edition}
          itemType='publishedEditions'
          editItem={editPublishedEdition}
          deleteItem={deletePublishedEdition}
        />
      </Suspense>
    </article>
  )
}
