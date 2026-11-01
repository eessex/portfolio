import type { Metadata } from 'next'

import { EditEventForm } from '@/ui/events/edit-event-form'
import { FormPageLayout } from '@/ui/form/form-page-layout'

const title = 'New Event'
export const metadata: Metadata = { title }

export default function NewEventPage() {
  return (
    <FormPageLayout title={title}>
      <EditEventForm />
    </FormPageLayout>
  )
}
