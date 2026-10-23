import NextImage from 'next/image'
import NextLink from 'next/link'

import styles from '@/app/home.module.scss'
import { fetchCachedUpcomingEvents } from '@/lib/events/cached'
import { ABOUT_PATH } from '@/lib/schemas'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { UpcomingEventsList } from '@/ui/events/upcoming-events-list'

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
            href={`/${ABOUT_PATH}`}
            className={'button ' + styles.description}
          >
            {siteSettings.description}
          </NextLink>
        )}
      </section>

      <UpcomingEventsList
        initialEvents={publicEvents}
        isTextOnly
        title='Upcoming Events'
      />
    </div>
  )
}
