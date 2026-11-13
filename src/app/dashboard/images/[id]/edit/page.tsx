import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { deleteImage, editImage } from '@/lib/images/actions'
import { fetchImageById } from '@/lib/images/data'
import type { Image } from '@/lib/images/schemas/db'
import { EmbeddedItemTypes } from '@/lib/schemas'
import type { PageEmbeddedItemProps } from '@/lib/types'
import { DashboardHeader } from '@/ui/dashboard/dashboard-layout'
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
      <DashboardHeader
        title={title}
        itemType={EmbeddedItemTypes.images}
      />

      <Suspense fallback={<Loading />}>
        <EditEmbeddedItemForm<Image>
          item={image}
          itemType={EmbeddedItemTypes.images}
          editItem={editImage}
          deleteItem={deleteImage}
        />
      </Suspense>
    </article>
  )
}
