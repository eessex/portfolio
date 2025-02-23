import { EventClient } from '@/lib/definitions'
import { VenueInline } from '@/ui/venue'
import styles from '@/ui/events-grid/events-grid.module.scss'

export default function EventsGrid ({
  events,
  isUpcoming = false
}: {
  events: EventClient[];
  isUpcoming?: boolean;
}) {
  return (
    <section>
      <h2>{isUpcoming ? 'Upcoming Events' : 'Past Events'}</h2>

      <ul className={styles.grid}>
        {events.map(({ images, venue, ...event }, index) => (
          <li key={index}>
            {images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[0].url}
                alt={images[0].caption || 'Event image'}
              />
            )}
            <h3>{event.title}</h3>
            <h4>
              <VenueInline venue={venue} />
            </h4>
          </li>
        ))}
      </ul>
    </section>
  )
}
