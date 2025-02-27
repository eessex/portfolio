import { fetchEventBySlug, fetchEvents } from '@/lib/data'
import { formattedDateTime } from '@/ui/util'
import { VenueInline } from '@/ui/venue'
import { Metadata } from 'next'
import styles from '@/events/[slug]/event.module.scss'
import Link from 'next/link'

const title = 'Event'
export const metadata: Metadata = { title }

// FIXME: just get the whole event when generating param?
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

  return (
    <article className={`p-4 md:2 ${styles.event}`}>
      <header>
        <div className={styles.category}>
          <Link href='/events'>Event</Link>
        </div>
        <h1>{event.title}</h1>
        <h2>{formattedDateTime(event.startDate)}</h2>
        <h3>
          <VenueInline venue={event.venue} />
        </h3>

        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.images[0].url} alt={event.images[0].caption} />
          <figcaption>{event.images[0].caption}</figcaption>
        </figure>
      </header>

      <section>
        {event.description && <p>{event.description}</p>}
      </section>
    </article>
  )
}
