import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedEventById } from '@/lib/events/cached'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'
import { EditEventForm } from '@/ui/events/edit-event-form'

const title = 'Edit Event'
export const metadata: Metadata = { title }

export default async function EditEventPage({
  params
}: PageItemProps) {
  const { slug } = await params
  const resolved = await resolveSlug(PagePaths.events, slug)
  const authed = await isAuthed()
  const event =
    resolved && (await fetchCachedEventById(resolved.id, authed))

  if (!event) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditEventForm event={event} />
    </article>
  )
}
