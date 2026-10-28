import type { Metadata } from 'next'

import { EditPageLayout } from '@/app/(item-pages)/edit-page-layout'
import { EditEventForm } from '@/ui/events/edit-event-form'

const title = 'New Event'
export const metadata: Metadata = { title }

export default function NewEventPage() {
  return (
    <EditPageLayout title={title}>
      <EditEventForm />
    </EditPageLayout>
  )
}
