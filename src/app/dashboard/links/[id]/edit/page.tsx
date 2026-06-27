import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { editLink } from '@/lib/links/actions'
import { fetchLinksByIds } from '@/lib/links/data'
import type { Link } from '@/lib/links/types'
import type { PageEmbeddedItemProps } from '@/lib/types'
import { Loading } from '@/ui/loading'

const title = 'Edit Link'

export const metadata: Metadata = { title }

export default async function EditLinkPage({
  params
}: PageEmbeddedItemProps) {
  const { id } = await params
  const [link] = await fetchLinksByIds([id])

  if (!link) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditEmbeddedItemForm<Link>
          item={link}
          itemType='links'
          editItem={editLink}
        />
      </Suspense>
    </article>
  )
}
