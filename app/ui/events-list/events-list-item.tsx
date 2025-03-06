import { EventClient } from '@/lib/definitions'
import styles from '@/ui/events-list/events-list.module.scss'
import { formattedDateTime } from '@/ui/util'
import { VenueInline } from '@/ui/venue'
import Link from 'next/link'

export default function EventsGridItem ({
  event,
  index,
}: {
  event: EventClient;
  index: number;
}) {
  return (
    <article>
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

          <div className='font-bold md:font-normal'>
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
