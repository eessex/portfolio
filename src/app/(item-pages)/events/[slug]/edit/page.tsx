import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import {
  editItemTitle,
  generateEditItemMetadata
} from '@/app/(item-pages)/edit-item-metadata'
import { resolveEditItemId } from '@/app/(item-pages)/resolve-page-item'
import { fetchCachedEventById } from '@/lib/events/cached'
import { fetchEventById } from '@/lib/events/data'
import { PagePaths } from '@/lib/schemas'
import type { PageItemProps } from '@/lib/types'
import { EditEventForm } from '@/ui/events/edit-event-form'
import { FormPageLayout } from '@/ui/form/form-page-layout'
import { Loading } from '@/ui/loading'

const title = 'Edit Event'

export async function generateMetadata({ params }: PageItemProps) {
  return generateEditItemMetadata(
    params,
    PagePaths.events,
    fetchCachedEventById,
    title
  )
}

export default function EditEventPage({ params }: PageItemProps) {
  return (
    <Suspense
      fallback={
        <FormPageLayout title={title}>
          <Loading />
        </FormPageLayout>
      }
    >
      <EditEvent params={params} />
    </Suspense>
  )
}

async function EditEvent({ params }: PageItemProps) {
  const { slug } = await params
  const id = await resolveEditItemId(PagePaths.events, slug)
  // uncached: saving a stale form drops child ids added since
  const event = await fetchEventById(id, true)

  if (!event) return notFound()

  return (
    <FormPageLayout title={editItemTitle(title, event)}>
      <EditEventForm event={event} />
    </FormPageLayout>
  )
}
