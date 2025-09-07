import styles from '@/events/[slug]/event.module.scss'
import { fetchEventBySlug, fetchEvents } from '@/lib/data'
import type { Link as _Link } from '@/lib/links/types'
import { DraftBadge } from '@/ui/draft-badge'
import { EventsGrid } from '@/ui/events-grid/events-grid'
import { FigureImage } from '@/ui/images/image-figure'
import { LinksList } from '@/ui/links/link-list'
import { Loading } from '@/ui/loading'
import { filteredLinksByPress, formattedDateTime, isUpcomingDate } from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'
import { TicketIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '../../../auth'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata (
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  const [featuredImage, ..._images] = event?.images || []
  const images = featuredImage
    ? [{
        url: featuredImage.url,
        width: 1200,
        height: 1200 * featuredImage.aspect,
        alt: featuredImage.caption,
      }]
    : []

  const meta: Metadata = {
    title: `Event: ${event?.title}`,
    openGraph: { images }
  }

  return meta
}

export async function generateStaticParams () {
  const { upcomingEvents, pastEvents } = await fetchEvents()

  return [...upcomingEvents, ...pastEvents].map((event) => ({
    slug: event.slug,
  }))
}

export default async function EventsPage ({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const event = await fetchEventBySlug(slug)
  const { upcomingEvents } = await fetchEvents(!!session?.user)
  const [featuredImage, ..._images] = event?.images || []

  if (!event || (!event.isPublished && !session?.user)) {
    notFound()
  }

  const isUpcoming = isUpcomingDate(event.startDate)
  const category = isUpcoming ? 'Upcoming Event' : 'Event'

  const moreEvents = upcomingEvents.filter((e) => e.id !== event.id)

  return (
    <div>
      <article className={styles.event}>
        <header>
          <div className={styles.category}>
            <Link href='/events'>{category}</Link>
            {!event.isPublished && (
              <DraftBadge />
            )}
          </div>
          <h1>{event.title}</h1>
          <h2>{formattedDateTime(event.startDate)}</h2>
          <h3>
            {event.venue.url
              ? (
                <a href={event.venue.url} target='_blank' rel='noopener noreferrer'>
                  <VenueInline venue={event.venue} />
                </a>
                )
              : (
                <VenueInline venue={event.venue} />
                )}
          </h3>
          {event.ticketLink && isUpcoming && (
            <a className={'button ' + styles['ticket-link']} href={event.ticketLink} target='_blank' rel='noreferrer'>
              <TicketIcon />Tickets
            </a>
          )}
        </header>

        <FigureImage image={featuredImage} />

        <section>
          {event.description && (
            <p style={{ whiteSpace: 'pre-line' }}>
              {event.description}
            </p>
          )}

          {!!filteredLinksByPress(event.links)[0].length && (
            <LinksList links={filteredLinksByPress(event.links)[0]} />
          )}

          {!!filteredLinksByPress(event.links)[1].length && (
            <LinksList links={filteredLinksByPress(event.links)[1]} />
          )}
        </section>
      </article>

      <Suspense fallback={<Loading />}>
        {moreEvents.length > 0 && <EventsGrid events={moreEvents} isUpcoming isTextOnly />}
      </Suspense>
    </div>
  )
}
