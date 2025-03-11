import { EventClient } from '@/lib/definitions'
import { VenueInline } from '@/ui/venue'
import { formattedDateTime } from '@/ui/util'
import { TicketIcon } from '@heroicons/react/24/outline'

import Link from 'next/link'

export default function EventsGridItem ({
  event,
  index,
  isTextOnly = false,
}: {
  event: EventClient;
  index: number;
  isTextOnly?: boolean;
}) {
  return (
    <article>
      {event.images[0].url && !isTextOnly && (
        <figure>
          <Link href={`/events/${event.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.images[0].url}
              alt={event.images[0].caption || 'Event image'}
              style={{ aspectRatio: event.images[0].aspect }}
              loading={index > 8 ? 'lazy' : undefined}
              title={event.images[0].caption || undefined}
            />
          </Link>
        </figure>
      )}
      <section>
        <Link href={`/events/${event.slug}`}>

          <h3 style={{ fontSize: (!event.images[0].url || isTextOnly) ? 'xx-large' : undefined }}>
            {event.title}
          </h3>

          <h4>
            {formattedDateTime(event.startDate)}
          </h4>

          <h5>
            <VenueInline venue={event.venue} />
          </h5>
        </Link>
        {event.ticketLink && (
          <a className='button' href={event.ticketLink} target='_blank' rel='noreferrer'>
            <TicketIcon />Tickets
          </a>
        )}
      </section>
    </article>
  )
}
