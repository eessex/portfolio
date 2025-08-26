import { EventClient } from '@/lib/definitions'
import styles from '@/ui/items-list/items-list.module.scss'
import { eventUrl, formattedDateTime } from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'
import Link from 'next/link'
import { DraftBadge } from '@/ui/draft-badge'

export default function EventsListItem ({
  event,
  index: _index,
}: {
  event: EventClient;
  index: number;
}) {
  return (
    <article>
      <Link href={eventUrl(event.slug)}>
        <div className={styles.contentLeft}>
          <div>
            {formattedDateTime(event.startDate, 'md')}
          </div>

          <div className='font-bold md:font-normal'>
            {event.title} {!event.isPublished && <DraftBadge />}
          </div>
        </div>

        <div className={styles.contentRight}>
          <VenueInline venue={event.venue} format='sm' />
        </div>
      </Link>
    </article>
  )
}
