import NextImage from 'next/image'
import NextLink from 'next/link'
import { Suspense } from 'react'

import styles from '@/app/home.module.scss'
import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedUpcomingEvents } from '@/lib/events/cached'
import type { EventClient } from '@/lib/events/types'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { ItemsList } from '@/ui/items/items-list'

export default async function Home() {
  const [siteSettings, publicEvents] = await Promise.all([
    fetchCachedSiteSettings(),
    fetchCachedUpcomingEvents(false)
  ])

  return (
    <div className={styles.home}>
      <section className={styles.cover}>
        <h1 className='visually-hidden'>Homepage</h1>

        {siteSettings?.coverImage && (
          <figure
            style={{ aspectRatio: siteSettings.coverImage.aspect }}
          >
            <NextImage
              src={siteSettings.coverImage.url}
              alt={
                siteSettings.coverImage.alt ||
                siteSettings.coverImage.caption ||
                ''
              }
              title={
                siteSettings.coverImage.caption ||
                siteSettings.coverImage.alt ||
                undefined
              }
              width={Math.round(800 * siteSettings.coverImage.aspect)}
              height={800}
              sizes='(max-width: 768px) 100vw, 800px'
              priority
            />
          </figure>
        )}

        {siteSettings?.description && (
          <NextLink
            href='/about'
            className={'button ' + styles.description}
          >
            {siteSettings.description}
          </NextLink>
        )}
      </section>

      <Suspense fallback={<UpcomingEvents events={publicEvents} />}>
        <AuthedUpcomingEvents />
      </Suspense>
    </div>
  )
}

async function AuthedUpcomingEvents() {
  const upcomingEvents = await fetchCachedUpcomingEvents(
    await isAuthed()
  )

  return <UpcomingEvents events={upcomingEvents} />
}

function UpcomingEvents({ events }: { events: EventClient[] }) {
  if (events.length === 0) return null

  return (
    <ItemsList items={events} isTextOnly title='Upcoming Events' />
  )
}
