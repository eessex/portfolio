import { EventClient } from '@/lib/definitions'
import EventsListItem from '@/ui/events-list/events-list-item'
import styles from '@/ui/items-list/items-list.module.scss'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button'
import { useId } from 'react'

export function EventsList ({
  events,
  isExpanded = false,
  isUpcoming = false,
  onExpand
}: {
  events: EventClient[];
  isExpanded?: boolean;
  isUpcoming?: boolean;
  onExpand?: () => void;
}) {
  const id = useId()

  return (
    <section aria-labelledby={id} className={styles['items-list']}>
      <header>
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
