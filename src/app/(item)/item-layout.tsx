import { TicketIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { auth } from '@/api/auth'
import styles from '@/app/(item)/item-layout.module.scss'
import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PagePathType } from '@/lib/types'
import { DraftBadge } from '@/ui/draft-badge'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { EmbedCodes } from '@/ui/embed-codes/embed-codes'
import { ImageFigure } from '@/ui/images/image-figure'
import { itemSortDate } from '@/ui/items/item-date'
import { LinksList } from '@/ui/links/link-list'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import {
  camelToSentence,
  filteredLinksByPress,
  formattedDateTime,
  isUpcomingDate
} from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'

export default async function ItemLayout ({
  itemType,
  slug,
  fetchFn,
  children
}: {
  itemType: PagePathType
  slug: string
  fetchFn: (slug: string, includeUnpublished?: boolean) => Promise<EventClient | ReleaseClient | null>
  children: React.ReactNode
}) {
  const session = await auth()
  const item = await fetchFn(slug, !!session?.user)

  if (!item) {
    notFound()
  }

  const isUpcoming = (item as EventClient).startTime ? isUpcomingDate((item as EventClient).startTime) : false

  function category () {
    switch (itemType) {
      case 'events': return isUpcoming ? 'Upcoming Event' : 'Event'
      case 'releases': return camelToSentence((item as ReleaseClient).type || itemType)
      default: return ''
    }
  }

  return (
    <div className={styles['item-layout']}>
      <article>
        <header>
          <p className='category'>
            <NextLink href={`/${item.path}`}>{category()}</NextLink>
            {!item.isPublished && (
              <DraftBadge />
            )}
          </p>

          <h1>
            {(item as ReleaseClient).artist && `${(item as ReleaseClient).artist}:`} {item.title}
          </h1>

          {(item as ReleaseClient).publishedEditions
            ? (
              <PublishedEditionsCombined publishedEditions={(item as ReleaseClient).publishedEditions} />
              )
            : (
              <p>
                {formattedDateTime(itemSortDate(item), undefined, (item as EventClient).venue?.timezone || undefined)}
              </p>
              )}

          {(item as EventClient).venue && (
            <p className='text-sm'>
              {(item as EventClient).venue!.url
                ? (
                  <a
                    href={(item as EventClient).venue!.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <VenueInline venue={(item as EventClient).venue!} />
                  </a>
                  )
                : (
                  <VenueInline venue={(item as EventClient).venue!} />
                  )}
            </p>
          )}

          {(item as EventClient).ticketLink && isUpcoming && (
            <p className={styles['ticket-link']}>
              <a
                className='button'
                href={(item as EventClient).ticketLink}
                target='_blank'
                rel='noreferrer'
              >
                <TicketIcon />Tickets
              </a>
            </p>
          )}
        </header>

        <section
          id='featured-media'
          className={styles['featured-media']}
        >
          <h2 className='visually-hidden'>Featured Media</h2>
          {item.featuredEmbedCode && (
            <EmbedCodeItem embedCode={item.featuredEmbedCode} />
          )}
          {item.coverImage && (
            <ImageFigure
              image={item.coverImage}
              isPriority
            />
          )}
        </section>

        <section id='description'>
          <h2 className='visually-hidden'>Description</h2>
          {item.description && (
            <p style={{ whiteSpace: 'pre-line' }}>
              {item.description}
            </p>
          )}
        </section>

        {item.links && !!filteredLinksByPress(item.links)[0].length && (
          <LinksList
            links={filteredLinksByPress(item.links)[0]}
            className={styles['press-links']}
            isPress
          />
        )}
        {item.links && !!filteredLinksByPress(item.links)[1].length && (
          <LinksList
            links={filteredLinksByPress(item.links)[1]}
            className={styles['related-links']}
          />
        )}
        {item.embedCodes && (
          <EmbedCodes embedCodes={item.embedCodes} />
        )}
      </article>

      {children}
    </div>
  )
}
