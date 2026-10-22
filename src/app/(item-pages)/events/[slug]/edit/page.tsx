import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { resolveEditItemId } from '@/app/(item-pages)/resolve-page-item'
import { fetchEventById } from '@/lib/events/data'
import { PagePaths } from '@/lib/schemas'
import type { PageItemProps } from '@/lib/types'
import { EditEventForm } from '@/ui/events/edit-event-form'
import { Loading } from '@/ui/loading'

const title = 'Edit Event'
export const metadata: Metadata = { title }

export default function EditEventPage({ params }: PageItemProps) {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditEvent params={params} />
      </Suspense>
    </article>
  )
}

async function EditEvent({ params }: PageItemProps) {
  const { slug } = await params
  const id = await resolveEditItemId(PagePaths.events, slug)
  // uncached: saving a stale form drops child ids added since
  const event = await fetchEventById(id, true)

  if (!event) return notFound()

  return <EditEventForm event={event} />
}
