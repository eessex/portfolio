import NextImage from 'next/image'
import NextLink from 'next/link'

import styles from '@/app/home.module.scss'
import { auth } from '@/auth'
import { fetchEvents } from '@/lib/events/data'
import { fetchSiteSettings } from '@/lib/site-settings/data'
import { ItemsList } from '@/ui/items/items-list'

export default async function Home() {
  const [siteSettings, session] = await Promise.all([
    fetchSiteSettings(),
    auth()
  ])
  const {
    res: { upcomingEvents }
  } = await fetchEvents(!!session?.user)

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
              width={800 * siteSettings.coverImage.aspect}
              height={800}
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

      {upcomingEvents.length > 0 && (
        <ItemsList
          items={upcomingEvents}
          isTextOnly
          title='Upcoming Events'
        />
      )}
    </div>
  )
}
