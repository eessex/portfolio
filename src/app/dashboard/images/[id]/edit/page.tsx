import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editImage } from '@/lib/images/actions'
import { fetchImageById } from '@/lib/images/data'
import type { Image } from '@/lib/images/schemas/db'
import { EmbeddedItemTypes } from '@/lib/schemas'
import type { PageEmbeddedItemProps } from '@/lib/types'
import { Loading } from '@/ui/loading'

const title = 'Edit Image'
export const metadata: Metadata = { title }

export default async function EditImagePage({
  params
}: PageEmbeddedItemProps) {
  const { id } = await params
  const image = await fetchImageById(id)

  if (!image) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditEmbeddedItemForm<Image>
          item={image}
          itemType={EmbeddedItemTypes.images}
          editItem={editImage}
        />
      </Suspense>
    </article>
  )
}
