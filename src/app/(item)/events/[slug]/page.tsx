import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// import { auth } from '@/api/auth'
import ItemLayout from '@/app/(item)/item-layout'
import {
  fetchEventBySlug,
  fetchEvents
} from '@/lib/events/data'
// import { ItemsList } from '@/ui/items/items-list'

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
  // const { upcomingEvents } = await fetchEvents(!!session?.user)

  // const moreEvents = upcomingEvents.filter(e => e.id !== event.id)

  if (!slug) return notFound()

  return (
    <ItemLayout
      itemType='events'
      slug={slug}
      fetchFn={fetchEventBySlug}
    >
      {/* {moreEvents.length > 0 && (
        <ItemsList
          items={moreEvents}
          isTextOnly
          title='Upcoming Events'
        />
      )} */}
    </ItemLayout>
  )
}
