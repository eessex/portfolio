'use client'

import EventsGrid from '@/ui/events-grid/events-grid'
import { EventsList } from '@/ui/events-list/events-list'
import { EventClient } from '@/lib/definitions'
import { useState } from 'react'

export function PastEvents ({ events }: { events: EventClient[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <>
      {isExpanded
        ? <EventsGrid events={events} isUpcoming={false} onExpand={() => setIsExpanded(false)} isExpanded={isExpanded} />
        : <EventsList events={events} isUpcoming={false} onExpand={() => setIsExpanded(true)} isExpanded={isExpanded} />}
    </>
  )
}
