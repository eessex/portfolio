import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchCachedDefaultProject } from '@/lib/projects/cached'
import { EditEventForm } from '@/ui/events/edit-event-form'
import { Loading } from '@/ui/loading'

const title = 'New Event'
export const metadata: Metadata = { title }

export default function NewEventPage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <NewEvent />
      </Suspense>
    </article>
  )
}

async function NewEvent() {
  const defaultProject = await fetchCachedDefaultProject(true)

  return <EditEventForm defaultProject={defaultProject} />
}
