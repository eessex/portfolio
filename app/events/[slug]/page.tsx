import styles from '@/events/[slug]/event.module.scss'
import { fetchEventBySlug, fetchEvents } from '@/lib/data'
import EventsGrid from '@/ui/events-grid/events-grid'
import Loading from '@/ui/loading'
import { formattedDateTime, isUpcomingDate } from '@/ui/util'
import { VenueInline } from '@/ui/venue'
import { TicketIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata (
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)

  const images = event?.images[0]
    ? [{
        url: event.images[0].url,
        width: 1200,
        height: 1200 * event.images[0].aspect,
        alt: event.images[0].caption,
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
  const event = await fetchEventBySlug(slug)
  const { upcomingEvents } = await fetchEvents()

  if (!event) {
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
          {event.ticketLink && (
            <a className={'button ' + styles['ticket-link']} href={event.ticketLink} target='_blank' rel='noreferrer'>
              <TicketIcon />Tickets
            </a>
          )}
        </header>

        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.images[0].url} alt={event.images[0].caption} style={{ aspectRatio: event.images[0].aspect }} />
          <figcaption>{event.images[0].caption}</figcaption>
        </figure>

        <section>
          {event.description && (
            <p>{event.description}</p>
          )}
        </section>
      </article>

      <Suspense fallback={<Loading />}>
        {upcomingEvents.length > 0 && <EventsGrid events={moreEvents} isUpcoming isTextOnly />}
      </Suspense>
    </div>
  )
}
