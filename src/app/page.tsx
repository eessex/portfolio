import NextLink from 'next/link'

import styles from '@/app/home.module.scss'
import { fetchCachedUpcomingEvents } from '@/lib/events/cached'
import { imageAspect } from '@/lib/images/util'
import { ABOUT_PATH } from '@/lib/schemas'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { UpcomingEventsList } from '@/ui/events/upcoming-events-list'
import { StoredImage } from '@/ui/images/stored-image'

export default async function Home() {
  const [siteSettings, publicEvents] = await Promise.all([
    fetchCachedSiteSettings(),
    fetchCachedUpcomingEvents(false)
  ])

  const coverImage = siteSettings?.coverImage
  const coverAspect = coverImage ? imageAspect(coverImage) : 1

  return (
    <div className={styles.home}>
      <section className={styles.cover}>
        <h1 className='visually-hidden'>Homepage</h1>

        {coverImage && (
          <figure style={{ aspectRatio: coverAspect }}>
            <StoredImage
              image={coverImage}
              alt={coverImage.alt || coverImage.caption || ''}
              title={
                coverImage.caption || coverImage.alt || undefined
              }
              width={Math.round(800 * coverAspect)}
              height={800}
              sizes='(max-width: 768px) 100vw, 800px'
              preload
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
