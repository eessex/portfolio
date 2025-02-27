import clsx from 'clsx'
import { EventClient } from '@/lib/definitions'
import EventsGridItem from '@/ui/events-grid/events-grid-item'
import styles from '@/ui/events-grid/events-grid.module.scss'

export default function EventsGrid ({
  events,
  isUpcoming = false
}: {
  events: EventClient[];
  isUpcoming?: boolean;
}) {
  return (
    <section className='p-4 md:2 '>
      <h2 className='py-2'>{isUpcoming ? 'Upcoming Events' : 'Past Events'}</h2>

      <ul className={clsx(styles.grid, isUpcoming && styles.upcoming)}>
        {events.map((event, index) => (
          <li key={event.id}>
            <EventsGridItem event={event} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
