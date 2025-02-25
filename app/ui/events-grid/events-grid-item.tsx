import { EventClient } from '@/lib/definitions'
import { VenueInline } from '@/ui/venue'

export default function EventsGridItem ({
  event,
  index,
}: {
  event: EventClient;
  index: number;
  isUpcoming?: boolean;
}) {
  function formattedDateTime () {
    const startDate = new Date(event.startDate)
    // FIXME: offset is a hack to adjust for timezone after posgres migration
    startDate.setHours(startDate.getHours() - 4)
    const date = new Date(startDate).toLocaleDateString('en-us', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    })

    return date
  }

  return (
    <article>
      {event.images[0].url && (
      // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.images[0].url}
          alt={event.images[0].caption || 'Event image'}
          style={{ aspectRatio: event.images[0].aspect }}
          loading={index > 8 ? 'lazy' : undefined}
        />
      )}

      <h3 style={{ fontSize: !event.images[0].url ? 'xx-large' : undefined }}>
        {event.title}
      </h3>

      <h4>
        {formattedDateTime()}
      </h4>

      <h5>
        <VenueInline venue={event.venue} />
      </h5>
    </article>
  )
}
