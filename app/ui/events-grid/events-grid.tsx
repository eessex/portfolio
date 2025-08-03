import { EventClient } from '@/lib/definitions'
import EventsGridItem from '@/ui/events-grid/events-grid-item'
import styles from '@/ui/items-grid/items-grid.module.scss'
import clsx from 'clsx'
import { useId } from 'react'

export default function EventsGrid ({
  events,
  isColumn = false,
  isTextOnly = false,
  isUpcoming = false
}: {
  events: EventClient[];
  isColumn?: boolean;
  isTextOnly?: boolean;
  isUpcoming?: boolean;
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={styles['items-grid']}>
      <h2 id={id}>
        {isUpcoming ? 'Upcoming Events' : 'Past Events'}
      </h2>

      <ul className={clsx(isUpcoming && styles.upcoming, isColumn && styles.column)}>
        {events.map((event, index) => (
          <li key={event.id}>
            <EventsGridItem
              event={event}
              index={index}
              isTextOnly={isTextOnly || (isUpcoming && index !== 0)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
