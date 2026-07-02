import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editEmbedCode } from '@/lib/embed-codes/actions'
import { fetchEmbedCodesByIds } from '@/lib/embed-codes/data'
import type { EmbedCode } from '@/lib/embed-codes/types'
import { EmbeddedItemTypes } from '@/lib/schemas'
import type { PageEmbeddedItemProps } from '@/lib/types'
import { Loading } from '@/ui/loading'

const title = 'Edit Embed Code'
export const metadata: Metadata = { title }

export default async function EditEmbedCodePage({
  params
}: PageEmbeddedItemProps) {
  const { id } = await params
  const [embedCode] = await fetchEmbedCodesByIds([id])

  if (!embedCode) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditEmbeddedItemForm<EmbedCode>
          itemType={EmbeddedItemTypes.embedCodes}
          item={embedCode}
          editItem={editEmbedCode}
        />
      </Suspense>
    </article>
  )
}
