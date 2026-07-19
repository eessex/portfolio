'use client'

import { useEffect, useRef, useState } from 'react'

import type { EventClient } from '@/lib/events/types'
import { ItemsList } from '@/ui/items/items-list'
import { useIsAdmin } from '@/ui/useIsAdmin'

/**
 * Upcoming events as an ItemsList with client-side draft
 * augmentation: pages render the published set statically; for
 * signed-in admins this refetches the full set (the API gates
 * drafts on the session cookie) and replaces the list.
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
  const [events, setEvents] = useState(initialEvents)
  const isAdmin = useIsAdmin()
  const didAugmentRef = useRef(false)

  useEffect(() => {
    if (!isAdmin || didAugmentRef.current) return
    didAugmentRef.current = true

    let cancelled = false

    fetch('/api/events/upcoming')
      .then((res) => res.json())
      .then((data: EventClient[]) => {
        if (!cancelled && Array.isArray(data)) setEvents(data)
      })
      .catch(() => {
        // static published list stands
      })

    return () => {
      cancelled = true
    }
  }, [isAdmin])

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
