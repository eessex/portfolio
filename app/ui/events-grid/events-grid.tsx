import { EventClient } from '@/lib/definitions'
import EventsGridItem from '@/ui/events-grid/events-grid-item'
import styles from '@/ui/events-grid/events-grid.module.scss'
import clsx from 'clsx'

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
  return (
    <section className='px-4 pt-4 pb-8'>
      <h2 className='py-2'>{isUpcoming ? 'Upcoming Events' : 'Past Events'}</h2>

      <ul className={clsx(styles.grid, isUpcoming && styles.upcoming, isColumn && styles.column)}>
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
