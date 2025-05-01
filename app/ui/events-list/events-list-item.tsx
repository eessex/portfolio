import { EventClient } from '@/lib/definitions'
import styles from '@/ui/events-list/events-list.module.scss'
import { formattedDateTime } from '@/ui/util'
import { VenueInline } from '@/ui/venue'
import Link from 'next/link'

export default function EventsListItem ({
  event,
  index,
}: {
  event: EventClient;
  index: number;
}) {
  return (
    <article>
      <Link href={`/events/${event.slug}`}>
        <div className={styles.contentLeft}>
          <div>
            {formattedDateTime(event.startDate, 'md')}
          </div>

          <div className='font-bold md:font-normal'>
            {event.title}
          </div>
        </div>

        <div className={styles.contentRight}>
          <VenueInline venue={event.venue} format='sm' />
        </div>
      </Link>
    </article>
  )
}
