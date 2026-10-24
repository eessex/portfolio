'use client'

import type { EventClient } from '@/lib/events/types'
import { ItemsList } from '@/ui/items/items-list'
import { useAdminRefetch } from '@/ui/use-admin-refetch'

/**
 * Upcoming events as an ItemsList: pages render the published set
 * statically, and signed-in admins also see drafts
 * (`useAdminRefetch`).
 */
export function UpcomingEventsList({
  initialEvents,
  excludeId,
  title,
  isTextOnly
}: {
  initialEvents: EventClient[]
  /** Omit the event being viewed (detail pages) */
  excludeId?: string
  title?: string
  isTextOnly?: boolean
}) {
  const events = useAdminRefetch(
    initialEvents,
    '/api/events/upcoming',
    pickEvents
  )

  const displayedEvents = excludeId
    ? events.filter((event) => event.id !== excludeId)
    : events

  return (
    <ItemsList
      items={displayedEvents}
      isTextOnly={isTextOnly}
      title={title}
    />
  )
}

function pickEvents(data: unknown) {
  return Array.isArray(data) ? (data as EventClient[]) : undefined
}
