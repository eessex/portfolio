import { EventClient } from '@/lib/definitions'
import { VenueInline } from '@/ui/venue'
import { formattedDateTime } from '@/ui/util'
import Link from 'next/link'

export default function EventsGridItem ({
  event,
  index,
}: {
  event: EventClient;
  index: number;
  isUpcoming?: boolean;
}) {
  return (
    <article>
      {event.images[0].url && (
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
      )}
      <Link href={`/events/${event.slug}`}>

        <h3 style={{ fontSize: !event.images[0].url ? 'xx-large' : undefined }}>
          {event.title}
        </h3>

        <h4>
          {formattedDateTime(event.startDate)}
        </h4>

        <h5>
          <VenueInline venue={event.venue} />
        </h5>
      </Link>
    </article>
  )
}
