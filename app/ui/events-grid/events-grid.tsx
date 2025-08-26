import { EventClient } from '@/lib/definitions'
import { EventsGridItem } from '@/ui/events-grid/events-grid-item'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button'
import styles from '@/ui/items-grid/items-grid.module.scss'
import clsx from 'clsx'
import { useId } from 'react'

export function EventsGrid ({
  events,
  isColumn = false,
  isExpanded = false,
  isTextOnly = false,
  isUpcoming = false,
  onExpand
}: {
  events: EventClient[];
  isColumn?: boolean;
  isExpanded?: boolean;
  isTextOnly?: boolean;
  isUpcoming?: boolean;
  onExpand?: () => void;
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={styles['items-grid']}>
      <header>
        <h2 id={id}>
          {isUpcoming ? 'Upcoming Events' : 'Past Events'}
        </h2>
        {onExpand && <ExpandCollapseButton isExpanded={isExpanded} onExpand={onExpand} />}
      </header>

      <ul className={clsx(isUpcoming && styles.upcoming, isColumn && styles.column)}>
        {events.map((event, index) => (
          <li key={event.id}>
            <EventsGridItem
              event={event}
              index={index}
              isTextOnly={isTextOnly || (isUpcoming && index !== 0)}
              isUpcoming={isUpcoming}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
