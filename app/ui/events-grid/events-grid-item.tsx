import { EventClient } from '@/lib/definitions'
import { VenueInline } from '@/ui/venue'
import { formattedDateTime } from '@/ui/util'
import { TicketIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { DraftBadge } from '../draft-badge'

export default function EventsGridItem ({
  event,
  index,
  isTextOnly = false,
}: {
  event: EventClient;
  index: number;
  isTextOnly?: boolean;
}) {
  const [featuredImage, ..._images] = event?.images || []

  return (
    <article>
      {featuredImage?.url && !isTextOnly && (
        <figure style={{ aspectRatio: featuredImage.aspect }}>
          <Link href={`/events/${event.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage.url}
              alt={featuredImage.caption || ''}
              style={{ aspectRatio: featuredImage.aspect }}
              loading={index > 8 ? 'lazy' : undefined}
              title={featuredImage.caption || undefined}
            />
          </Link>
        </figure>
      )}
      <section>
        <Link href={`/events/${event.slug}`}>

          <h3>
            {event.title}
          </h3>

          {!event.isPublished && <DraftBadge />}

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
