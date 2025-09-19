import type { EventClient } from '@/lib/events/types'
import { DraftBadge } from '@/ui/draft-badge'
import styles from '@/ui/items/items.module.scss'
import { eventUrl, formattedDateTime } from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'
import NextLink from 'next/link'

export function EventsListItem ({
  event,
  index: _index,
}: {
  event: EventClient;
  index: number;
}) {
  return (
    <article>
      <NextLink href={eventUrl(event.slug)}>
        <div className={styles.contentLeft}>
          <div>
            {formattedDateTime(event.startTime, 'md')}
          </div>

          <div className='font-bold md:font-normal'>
            {event.title} {!event.isPublished && <DraftBadge />}
          </div>
        </div>

        {event.venue && (
          <div className={styles.contentRight}>
            <VenueInline venue={event.venue} format='sm' />
          </div>
        )}
      </NextLink>
    </article>
  )
}
