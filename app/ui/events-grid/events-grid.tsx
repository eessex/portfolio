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
    <section className='p-6'>
      <h2>{isUpcoming ? 'Upcoming Events' : 'Past Events'}</h2>

      <ul className={styles.grid}>
        {events.map((event, index) => (
          <li key={event.id}>
            <EventsGridItem event={event} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
