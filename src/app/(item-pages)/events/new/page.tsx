import type { Metadata } from 'next'

import { EditEventForm } from '@/ui/events/edit-event-form'

const title = 'New Event'
export const metadata: Metadata = { title }

export default function NewEventPage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEventForm />
    </article>
  )
}
