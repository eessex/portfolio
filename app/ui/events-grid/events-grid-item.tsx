import type { EventClient } from '@/lib/events/types'
import type { Image } from '@/lib/images/types'
import { DraftBadge } from '@/ui/draft-badge'
import { eventUrl, formattedDateTime } from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'
import { TicketIcon } from '@heroicons/react/24/outline'
import NextImage from 'next/image'
import NextLink from 'next/link'

function Metadata ({ event }: { event: EventClient }) {
  return (
    <>
      <h3>
        {event.title}
      </h3>

      {!event.isPublished && <DraftBadge />}

      <h4>
        {formattedDateTime(event.startTime)}
      </h4>

      {event.venue && (
        <h5>
          <VenueInline venue={event.venue} />
        </h5>
      )}
    </>
  )
}

function Img ({ image, index }: { image: Image, index: number }) {
  return (
    <NextImage
      src={image.url}
      alt={image.alt || image.caption || ''}
      title={image.caption || image.alt || undefined}
      width={500 * image.aspect}
      height={500}
      loading={index > 4 ? 'lazy' : undefined}
    />
  )
}

export function EventsGridItem ({
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
      {isColumn() && !isTextOnly && event.coverImage && (
        <figure style={{ aspectRatio: event.coverImage.aspect }}>
          <NextLink href={eventUrl(event.slug)}>
            <Img image={event.coverImage} index={index} />
          </NextLink>
        </figure>
      )}
      <section>
        <NextLink href={eventUrl(event.slug)}>
          {!isColumn() && event.coverImage?.url && !isTextOnly && (
            <figure style={{ aspectRatio: event.coverImage.aspect }}>
              <Img image={event.coverImage} index={index} />
            </figure>
          )}
          <Metadata event={event} />
        </NextLink>

        {event.ticketLink && isUpcoming && (
          <a className='button' href={event.ticketLink} target='_blank' rel='noreferrer'>
            <TicketIcon />Tickets
          </a>
        )}
      </section>
    </article>
  )
}
