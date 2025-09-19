import { useId } from 'react'

import type { EventClient } from '@/lib/events/types'
import { EventsListItem } from '@/ui/events-list/events-list-item'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button/expand-collapse-button'
import styles from '@/ui/items/items.module.scss'

export function EventsList ({
  events,
  isExpanded = false,
  isUpcoming = false,
  onExpand
}: {
  events: EventClient[]
  isExpanded?: boolean
  isUpcoming?: boolean
  onExpand?: () => void
}) {
  const id = useId()

  return (
    <section aria-labelledby={id} className={styles['items-list']}>
      <header className={styles['items-header']}>
        <h2 id={id}>
          {isUpcoming ? 'Upcoming Events' : 'Past Events'}
        </h2>
        {onExpand && <ExpandCollapseButton isExpanded={isExpanded} onExpand={onExpand} />}
      </header>

      <ul>
        {events.map((event, index) => (
          <li key={event.id}>
            <EventsListItem event={event} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
