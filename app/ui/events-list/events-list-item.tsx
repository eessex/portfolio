import { EventClient } from '@/lib/definitions'
import { VenueInline } from '@/ui/venue'
import { formattedDateTime } from '@/ui/util'
import Link from 'next/link'
import styles from '@/ui/events-list/events-list.module.scss'

export default function EventsGridItem ({
  event,
  index,
}: {
  event: EventClient;
  index: number;
}) {
  return (
    <article className={styles.item}>
      {/* {event.images[0].url && !isTextOnly && (
        <Link href={`/events/${event.slug}`}>
          <img
            src={event.images[0].url}
            alt={event.images[0].caption || 'Event image'}
            style={{ aspectRatio: event.images[0].aspect }}
            loading={index > 8 ? 'lazy' : undefined}
            title={event.images[0].caption || undefined}
          />
        </Link>
      )}
      */}
      <Link href={`/events/${event.slug}`}>
        <div className={styles.contentLeft}>
          <div>
            {formattedDateTime(event.startDate)}
          </div>

          <div>
            {event.title}
          </div>
        </div>

        <div className={styles.contentRight}>
          <VenueInline venue={event.venue} />
        </div>
      </Link>
    </article>
  )
}
