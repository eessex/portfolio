import { TicketIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { auth } from '@/api/auth'
import styles from '@/app/events/[slug]/event.module.scss'
import {
  fetchEventBySlug,
  fetchEvents
} from '@/lib/events/data'
import { DraftBadge } from '@/ui/draft-badge'
import { EmbedCodes } from '@/ui/embed-codes/embed-codes'
import { ImageFIgure } from '@/ui/images/image-figure'
import { ItemsList } from '@/ui/items/items-list'
import { LinksList } from '@/ui/links/link-list'
import {
  filteredLinksByPress,
  formattedDateTime,
  isUpcomingDate
} from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata ({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  const images = event?.coverImage
    ? [{
        url: event.coverImage.url,
        width: 1200,
        height: 1200 * event.coverImage.aspect,
        alt: event.coverImage.alt || event.coverImage.caption || ''
      }]
    : []

  const meta: Metadata = {
    title: `Event: ${event?.title}`,
    openGraph: { images }
  }

  return meta
}

export async function generateStaticParams () {
  const {
    upcomingEvents,
    pastEvents
  } = await fetchEvents()

  return [...upcomingEvents, ...pastEvents].map((event) => ({ slug: event.slug }))
}

export default async function EventsPage ({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const event = await fetchEventBySlug(slug, !!session?.user)
  const { upcomingEvents } = await fetchEvents(!!session?.user)

  if (!event) {
    notFound()
  }

  const isUpcoming = isUpcomingDate(event.startTime)
  const category = isUpcoming ? 'Upcoming Event' : 'Event'
  const moreEvents = upcomingEvents.filter(e => e.id !== event.id)

  return (
    <div>
      <article className={styles.event}>
        <header>
          <div className={styles.category}>
            <NextLink href='/events'>{category}</NextLink>
            {!event.isPublished && (
              <DraftBadge />
            )}
          </div>
          <h1>{event.title}</h1>
          <h2>
            {formattedDateTime(event.startTime, undefined, event.venue?.timezone)}
          </h2>
          {event.venue && (
            <h3>
              {event.venue.url
                ? (
                  <a
                    href={event.venue.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <VenueInline venue={event.venue} />
                  </a>
                  )
                : (
                  <VenueInline venue={event.venue} />
                  )}
            </h3>
          )}
          {event.ticketLink && isUpcoming && (
            <a
              className={'button ' + styles['ticket-link']}
              href={event.ticketLink}
              target='_blank'
              rel='noreferrer'
            >
              <TicketIcon />Tickets
            </a>
          )}
        </header>

        {event.coverImage && (
          <ImageFIgure
            image={event.coverImage}
            isPriority
          />
        )}

        <section>
          {event.description && (
            <p style={{ whiteSpace: 'pre-line' }}>
              {event.description}
            </p>
          )}

          {event.links && !!filteredLinksByPress(event.links)[0].length && (
            <LinksList links={filteredLinksByPress(event.links)[0]} />
          )}

          {event.links && !!filteredLinksByPress(event.links)[1].length && (
            <LinksList links={filteredLinksByPress(event.links)[1]} />
          )}
          {event.featuredEmbedCode && (
            <EmbedCodes embedCodes={[event.featuredEmbedCode || event.embedCodes]} />
          )}
        </section>
      </article>

      {moreEvents.length > 0 && (
        <ItemsList
          items={moreEvents}
          isTextOnly
          title='Upcoming Events'
        />
      )}
    </div>
  )
}
