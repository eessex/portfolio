import { EventClient } from '@/lib/definitions'
import EventsListItem from '@/ui/events-list/events-list-item'
import styles from '@/ui/items-list/items-list.module.scss'
import { useId } from 'react'

export default function EventsGrid ({
  events,
  isUpcoming = false
}: {
  events: EventClient[];
  isUpcoming?: boolean;
}) {
  const id = useId()

  return (
    <section aria-labelledby={id} className={styles['items-list']}>
      <h2 id={id}>
        {isUpcoming ? 'Upcoming Events' : 'Past Events'}
      </h2>

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
