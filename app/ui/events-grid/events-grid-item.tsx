import { EventClient } from '@/lib/definitions'
import { VenueInline } from '@/ui/venue'
import { formattedDateTime, eventUrl } from '@/ui/util'
import { TicketIcon } from '@heroicons/react/24/outline'
import { DraftBadge } from '@/ui/draft-badge'
import Link from 'next/link'

function Metadata ({ event }: { event: EventClient }) {
  return (
    <>
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
    </>
  )
}

function Img ({ image, index }: { image: EventClient['images'][number], index: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt={image.caption || ''}
      style={{ aspectRatio: image.aspect }}
      loading={index > 8 ? 'lazy' : undefined}
      title={image.caption || undefined}
    />
  )
}

export default function EventsGridItem ({
  event,
  index,
  isTextOnly = false,
  isUpcoming = false
}: {
  event: EventClient;
  index: number;
  isTextOnly?: boolean;
  isUpcoming?: boolean;
}) {
  const [featuredImage, ..._images] = event?.images || []
  function isColumn () {
    return featuredImage?.url && !isTextOnly && isUpcoming
  }

  return (
    <article>
      {isColumn() && (
        <figure style={{ aspectRatio: featuredImage.aspect }}>
          <Link href={eventUrl(event.slug)}>
            <Img image={featuredImage} index={index} />
          </Link>
        </figure>
      )}
      <section>
        <Link href={eventUrl(event.slug)}>
          {!isColumn() && featuredImage?.url && (
            <figure style={{ aspectRatio: featuredImage.aspect }}>
              <Img image={featuredImage} index={index} />
            </figure>
          )}
          <Metadata event={event} />
        </Link>

        {event.ticketLink && isUpcoming && (
          <a className='button' href={event.ticketLink} target='_blank' rel='noreferrer'>
            <TicketIcon />Tickets
          </a>
        )}
      </section>
    </article>
  )
}
