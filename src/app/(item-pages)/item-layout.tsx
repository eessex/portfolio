import clsx from 'clsx'
import NextLink from 'next/link'
import type { Metadata } from 'next/types'

import styles from '@/app/(item-pages)/item-layout.module.scss'
import { resolvePageItem } from '@/app/(item-pages)/resolve-page-item'
import type { EventClient } from '@/lib/events/types'
import { ogImage } from '@/lib/images/util'
import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import { type PagePath, PagePaths } from '@/lib/schemas'
import type {
  PageDataResponse,
  PageItemClient,
  PageItemProps,
  PageItemResponseWithCursor
} from '@/lib/types'
import { DraftBadge } from '@/ui/badges/draft-badge'
import { TicketButton } from '@/ui/buttons/ticket-button'
import { EmbedCodes } from '@/ui/embed-codes/embed-codes'
import { EmbedCodesCarousel } from '@/ui/embed-codes/embed-codes-carousel'
import {
  GalleryImageFigure,
  ImageGallery
} from '@/ui/images/image-gallery'
import {
  ImageInline,
  ImagesCarousel
} from '@/ui/images/images-carousel'
import {
  FormattedItemDate,
  itemDisplayDateFormat
} from '@/ui/items/item-date'
import { LinksList } from '@/ui/links/link-list'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import {
  formattedDateTime,
  formattedItemTitle,
  formattedItemType,
  formatVenueInline,
  itemUrl
} from '@/ui/util'

const IMAGES_CAROUSEL_MIN = 3

export default async function ItemLayout({
  item,
  children
}: {
  item: PageItemClient
  children?: React.ReactNode
}) {
  const { publishedEditions } = item as ReleaseClient
  const { ticketLink, venue, project, isUpcoming } =
    item as EventClient
  const { contactInfo, isDefaultProject } = item as ProjectClient
  const images = item.images ?? []
  const embedCodes = item.embedCodes ?? []

  // carousels sit below the article: 2+ embeds, or 3+ images counting
  // the cover (which `images` leaves out)
  const isEmbedsCarousel = embedCodes.length > 1
  const imageCount = images.length + (item.coverImage ? 1 : 0)
  const isImagesCarousel = imageCount >= IMAGES_CAROUSEL_MIN
  // one lightbox in page order: the cover, then the rest
  const galleryImages = item.coverImage
    ? [item.coverImage, ...images]
    : images

  function category() {
    switch (item.path) {
      case PagePaths.projects:
      case PagePaths.releases:
        return formattedItemType(
          (item as ReleaseClient | ProjectClient).type || item.path,
          isUpcoming
        )
      default:
        return formattedItemType(item.path, isUpcoming)
    }
  }

  return (
    <ImageGallery images={galleryImages}>
      <div
        className={clsx(
          styles['item-layout'],
          isDefaultProject && styles['default-project']
        )}
      >
        <article>
          <header>
            {isDefaultProject ? (
              !item.isPublished && (
                <p className='category'>
                  <DraftBadge />
                </p>
              )
            ) : (
              <p className='category'>
                <NextLink href={`/${item.path}`}>
                  {category()}
                </NextLink>
                {!item.isPublished && <DraftBadge />}
              </p>
            )}

            <h1>
              {isDefaultProject ? 'About' : formattedItemTitle(item)}
            </h1>

            {publishedEditions ? (
              <PublishedEditionsCombined
                publishedEditions={publishedEditions}
              />
            ) : (
              !isDefaultProject && (
                <p>
                  <FormattedItemDate
                    item={item}
                    timezone={(item as EventClient).venue?.timezone}
                  />
                </p>
              )
            )}

            {venue && (
              <p className={styles.venue}>
                {venue.url ? (
                  <a
                    href={venue.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {formatVenueInline({ venue })}
                  </a>
                ) : (
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

          {item.coverImage && (
            <GalleryImageFigure image={item.coverImage} isPriority />
          )}

          {item.description && (
            <p className={styles.description}>{item.description}</p>
          )}

          {!!contactInfo?.length && (
            <address>
              {contactInfo.map(({ title, contact }, i) => (
                <p key={i}>
                  {title ? (
                    <b>{title}: </b>
                  ) : (
                    // context for screen readers; <address> isn't announced
                    <span className='visually-hidden'>Contact: </span>
                  )}
                  {contact}
                </p>
              ))}
            </address>
          )}

          {item.links && <LinksList links={item.links} />}

          {project && !project.isDefaultProject && (
            <p>
              <NextLink
                href={itemUrl(project)}
                className='button-outline button-sm'
              >
                <b>Project:</b> {project.title}
              </NextLink>
            </p>
          )}

          {!!embedCodes.length && !isEmbedsCarousel && (
            <EmbedCodes embedCodes={embedCodes} />
          )}

          {!isImagesCarousel &&
            images.map((image) => (
              <ImageInline key={image.id} image={image} />
            ))}
        </article>

        {isEmbedsCarousel && (
          <EmbedCodesCarousel embedCodes={embedCodes} />
        )}

        {isImagesCarousel && <ImagesCarousel images={images} />}

        {children}
      </div>
    </ImageGallery>
  )
}

export async function generateItemMetadata(
  params: PageItemProps['params'],
  pagePath: PagePath,
  fetchById: (
    id: string,
    isIncludingUnpublished: boolean
  ) => Promise<PageItemClient | undefined>
): Promise<Metadata> {
  const { slug } = await params
  const { item } = await resolvePageItem(pagePath, slug, fetchById)

  const description = generateItemDescription(item)
  const { coverImage, path } = item
  const images = coverImage && [
    {
      ...ogImage(coverImage),
      alt: coverImage.alt || ''
    }
  ]
  const openGraph = images ? { images } : undefined

  return {
    title: `${formattedItemType(path)} | ${formattedItemTitle(item)}`,
    description,
    openGraph
  }
}

function generateEventDescription(item: PageItemClient) {
  const { startTime, venue } = item as EventClient
  const dateFormat = itemDisplayDateFormat(item)

  return `Live event at ${venue?.name || ''} on ${formattedDateTime(startTime, dateFormat, venue?.timezone)}.`
}

function generateItemDescription(item: PageItemClient) {
  if (item.shortDescription) {
    return item.shortDescription
  }

  switch (item.path) {
    case PagePaths.events:
      return generateEventDescription(item)
    default:
      return undefined
  }
}

// Cache Components requires a non-empty generateStaticParams. When there are
// no public slugs (nothing published yet), fall back to placeholder slug.
// Real slugs still render via dynamicParams.
export const placeholderStaticParamSlug = '__placeholder__'

export async function generateItemStaticParams<
  T extends PageItemClient,
  S extends PageDataResponse
>(fetchFn: () => Promise<PageItemResponseWithCursor<T, S>>) {
  const items = await fetchFn()
  const params = Object.values(items.res)
    .flat()
    .map((i) => ({ slug: (i as T).slug }))

  return params.length
    ? params
    : [{ slug: placeholderStaticParamSlug }]
}
