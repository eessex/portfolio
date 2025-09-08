import type { EventClient } from '@/lib/events/types'
import { EventsGridItem } from '@/ui/events-grid/events-grid-item'
import styles from '@/ui/items/items.module.scss'
import clsx from 'clsx'
import { useId } from 'react'

export function EventsGrid ({
  events,
  isTextOnly = false,
  isUpcoming = false,
}: {
  events: EventClient[];
  isTextOnly?: boolean;
  isUpcoming?: boolean;
}) {
  const id = useId()
  return (
    <section aria-labelledby={id}>
      <header className={styles['items-header']}>
        <h2 id={id}>
          {isUpcoming ? 'Upcoming Events' : 'Past Events'}
        </h2>
      </header>

      <ul className={clsx(styles['items-grid'])}>
        {events.map((event, index) => (
          <li key={event.id}>
            <EventsGridItem
              event={event}
              index={index}
              isTextOnly={isTextOnly}
              isUpcoming={isUpcoming}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
