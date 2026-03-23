import NextLink from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'

import styles from '@/app/(item-pages)/item-layout.module.scss'
import type { EventClient } from '@/lib/events/types'
import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type {
  PageDataResponse,
  PageItemClient,
  PageItemProps,
  PageItemResponseWithCursor
} from '@/lib/types'
import { TicketButton } from '@/ui/buttons/ticket-button'
import { DraftBadge } from '@/ui/draft-badge'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { EmbedCodes } from '@/ui/embed-codes/embed-codes'
import { ImageFigure } from '@/ui/images/image-figure'
import { FormattedItemDate } from '@/ui/items/item-date'
import { LinksList } from '@/ui/links/link-list'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import {
  filteredLinksByPress,
  formattedItemTitle,
  formattedItemType,
  formatVenueInline,
  isUpcomingDate
} from '@/ui/util'

export default async function ItemLayout ({
  item,
  children
}: {
  item: PageItemClient
  children?: React.ReactNode
}) {
  const { publishedEditions } = item as ReleaseClient
  const {
    startTime,
    ticketLink,
    venue,
    project
  } = item as EventClient
  const isUpcoming = startTime ? isUpcomingDate(startTime) : false

  function category () {
    switch (item.path) {
      case 'projects':
      case 'releases':
        return formattedItemType((item as ReleaseClient | ProjectClient).type || item.path, isUpcoming)
      default:
        return formattedItemType(item.path, isUpcoming)
    }
  }

  return (
    <div className={styles['item-layout']}>
      <article>
        <header>
          <p className='category'>
            <NextLink href={`/${item.path}`}>{category()}</NextLink>
            {!item.isPublished && (<DraftBadge />)}
          </p>

          <h1>
            {formattedItemTitle(item)}
          </h1>

          {publishedEditions
            ? (
              <PublishedEditionsCombined publishedEditions={publishedEditions} />
              )
            : (
              <p>
                <FormattedItemDate
                  item={item}
                  timezone={(item as EventClient).venue?.timezone}
                />
              </p>
              )}

          {venue && (
            <p className={styles.venue}>
              {venue.url
                ? (
                  <a
                    href={venue.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {formatVenueInline({ venue })}
                  </a>
                  )
                : (
                    formatVenueInline({ venue })
                  )}
            </p>
          )}

          {ticketLink && isUpcoming && (
            <p className={styles['ticket-link']}>
              <TicketButton url={ticketLink} />
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

        {project && (
          <p>
            <a
              href={`/${project.path}/${project.slug}`}
              className='category button-outline'
            >
              Project: {project.title}
            </a>
          </p>
        )}

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

export async function generateItemMetadata (
  params: PageItemProps['params'],
  fetchFn: (slug: string, includeUnpublished?: boolean) => Promise<PageItemClient | undefined>
): Promise<Metadata> {
  const { slug } = await params
  const item = await fetchFn(slug, true)
  if (!slug || !item) return notFound()

  const {
    coverImage,
    path
  } = item

  const images = coverImage &&
    [{
      url: coverImage.url,
      width: 1200,
      height: 1200 * coverImage.aspect,
      alt: coverImage.alt || coverImage.caption || ''
    }]
  const openGraph = images ? { images } : undefined

  const meta: Metadata = {
    title: `${formattedItemType(path)} | ${formattedItemTitle(item)}`,
    openGraph
  }
  return meta
}

export async function generateItemStaticParams<T extends PageItemClient, S extends PageDataResponse> (
  fetchFn: () => Promise<PageItemResponseWithCursor<T, S>>
) {
  const items = await fetchFn()
  return Object.values(items.res).flat().map(i => ({ slug: (i as T).slug }))
}
