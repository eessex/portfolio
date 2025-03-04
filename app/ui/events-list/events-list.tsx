import { EventClient } from '@/lib/definitions'
import EventsListItem from '@/ui/events-list/events-list-item'
import styles from '@/ui/events-list/events-list.module.scss'

export default function EventsGrid ({
  events,
  isUpcoming = false
}: {
  events: EventClient[];
  isUpcoming?: boolean;
}) {
  return (
    <section>
      <h2 className='px-4 py-3'>{isUpcoming ? 'Upcoming Events' : 'Past Events'}</h2>

      <ul>
        {events.map((event, index) => (
          <li key={event.id} className={styles.li}>
            <EventsListItem event={event} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
