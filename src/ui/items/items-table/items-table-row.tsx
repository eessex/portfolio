import {
  PencilIcon,
  SpeakerWaveIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import NextImage from 'next/image'
import NextLink from 'next/link'

import type { WithCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import type { EmbedCode } from '@/lib/embed-codes/schemas/db'
import type { EventClient } from '@/lib/events/types'
import type { ProjectClient } from '@/lib/projects/types'
import type { DashboardPublishedEdition } from '@/lib/published-editions/schemas/client'
import type { ReleaseClient } from '@/lib/releases/types'
import {
  type EmbeddedItemType,
  EmbeddedItemTypes,
  type PagePath,
  PagePaths
} from '@/lib/schemas'
import { camelToSnake } from '@/lib/strings'
import type { EmbeddedItem, PageItemClient } from '@/lib/types'
import type { Venue } from '@/lib/venues/schemas/db'
import type { ThumbnailImage } from '@/ui/cover-image-thumbnail'
import { DraftBadge } from '@/ui/draft-badge'
import { formattedEmbedCodeTitle } from '@/ui/embed-codes/embed-code-details'
import { coverImageAspectByHost } from '@/ui/embed-codes/util'
import { FormattedItemDate } from '@/ui/items/item-date'
import styles from '@/ui/items/items-table/items-table.module.scss'
import {
  formattedDateTime,
  formattedItemTitle,
  formattedItemType,
  formatVenueInline,
  isImageColumnVisible,
  itemUrl,
  usedOnPages
} from '@/ui/util'

function embeddedItemTitle(
  item: EmbeddedItem,
  itemType: PagePath | EmbeddedItemType
) {
  if (itemType === EmbeddedItemTypes.publishedEditions) {
    const { release } = item as DashboardPublishedEdition
    return release?.artist
      ? `${release.artist}: ${release.title}`
      : release?.title
  }

  if (itemType === EmbeddedItemTypes.venues) {
    return (item as Venue).name || 'Untitled venue'
  }

  return formattedEmbedCodeTitle(item as EmbedCode)
}

/**
 * Embedded items have no public-facing page, unlike `PageItemClient`
 * `path` is the field that distinguishes the two.
 */
function hasOwnPage(
  item: PageItemClient | EmbeddedItem
): item is PageItemClient {
  return 'path' in item
}

function UsedOnPagesLabel({ item }: { item: EmbeddedItem }) {
  const usedOn = usedOnPages(item)

  if (usedOn.length === 0) {
    return <span className={styles['unused']}>unused</span>
  }

  return (
    <span>
      used on {usedOn.length} page{usedOn.length === 1 ? '' : 's'}
    </span>
  )
}

export function ItemsTableRow({
  children,
  index,
  isAdmin = false,
  isCategoryVisible = false,
  isExpanded = false,
  isFeatured = false,
  isPathTypeVisible = false,
  item,
  itemType
}: {
  children?: React.ReactNode
  index?: number
  /**
   * Is the current visitor signed-in? Gates the edit link.
   */
  isAdmin?: boolean
  isCategoryVisible?: boolean
  isExpanded?: boolean
  isFeatured?: boolean
  isPathTypeVisible?: boolean
  item: PageItemClient | EmbeddedItem
  /**
   * The table's item type
   */
  itemType: PagePath | EmbeddedItemType
}) {
  if (!item) return null

  const { artist, coverImage } = item as ReleaseClient
  const embedCode = item as EmbedCode & WithCoverImageUrls
  const embedCodeImageUrl =
    embedCode.coverImageThumbnailUrl || embedCode.coverImageUrl
  const publishedEdition = item as DashboardPublishedEdition
  const rowCoverImage: ThumbnailImage | undefined =
    coverImage ||
    publishedEdition.release?.coverImage ||
    (embedCodeImageUrl
      ? {
          url: embedCodeImageUrl,
          aspect: coverImageAspectByHost(embedCode.host)
        }
      : undefined)
  const linkTarget = hasOwnPage(item) ? itemUrl(item) : undefined
  const rowLabel = hasOwnPage(item)
    ? `${item.title}${artist ? ', by ' + artist : ''}`
    : undefined
  const isEditLinkVisible = isAdmin && !hasOwnPage(item)
  const isPriorityImage = !!(isFeatured || (index || 0) < 12)
  const imageWidth = 350
  const hasAudio =
    hasOwnPage(item) &&
    item.path !== PagePaths.releases &&
    !!item.hasAudio
  const hasVideo = hasOwnPage(item) && !!item.hasVideo
  const isImageVisible = isImageColumnVisible(itemType)

  return (
    <tr
      data-index={index}
      className={clsx(
        styles['table-row-link'],
        isExpanded && styles['table-row-link--expanded'],
        isPathTypeVisible && styles['item-type-visible'],
        !hasOwnPage(item) && styles['embedded-row'],
        !isImageVisible && styles['no-image']
      )}
      onClick={
        linkTarget ? () => location.assign(linkTarget) : undefined
      }
      onKeyDown={
        linkTarget
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                location.assign(linkTarget)
              }
            }
          : undefined
      }
      tabIndex={linkTarget ? 0 : undefined}
      role={linkTarget ? 'link' : undefined}
      aria-label={rowLabel}
    >
      {isImageVisible && (
        <td className={styles['table-row-img']} aria-hidden='true'>
          {rowCoverImage && (
            <NextImage
              src={rowCoverImage.url}
              alt={rowCoverImage.alt || ''}
              title={rowCoverImage.caption || undefined}
              width={imageWidth}
              height={Math.round(imageWidth / rowCoverImage.aspect)}
              sizes={
                isExpanded
                  ? '(max-width: 768px) 50vw, 350px'
                  : '(max-width: 768px) 92px, 52px'
              }
              loading={(index || 0) > 12 ? 'lazy' : undefined}
              priority={isPriorityImage}
              fetchPriority={isPriorityImage ? 'high' : 'auto'}
              aria-hidden='true'
            />
          )}
        </td>
      )}

      {isPathTypeVisible && (
        <td className='category path-type'>
          {formattedItemType((item as PageItemClient).path)}
        </td>
      )}

      <td
        className={clsx(
          styles['table-row-title'],
          isExpanded && styles['table-row-title--expanded']
        )}
      >
        {hasOwnPage(item) ? (
          <NextLink href={linkTarget!}>
            {isCategoryVisible &&
              (item as ReleaseClient | ProjectClient).type && (
                <span className={styles['item-type'] + ' category'}>
                  {formattedItemType(
                    (item as ReleaseClient | ProjectClient).type!
                  )}
                </span>
              )}
            {formattedItemTitle(item)}
            {!item.isPublished && <DraftBadge />}
          </NextLink>
        ) : (
          <div className={styles['item-title-stack']}>
            <span>{embeddedItemTitle(item, itemType)}</span>
            {(item as EmbedCode).caption && (
              <span className={styles['item-title-stack-subtitle']}>
                {(item as EmbedCode).caption}
              </span>
            )}
            {itemType === EmbeddedItemTypes.venues &&
              formatVenueInline({
                venue: item as Venue,
                isNameHidden: true
              }) && (
                <span className={styles['item-title-stack-subtitle']}>
                  {formatVenueInline({
                    venue: item as Venue,
                    isNameHidden: true
                  })}
                </span>
              )}
          </div>
        )}
      </td>

      <td>
        {hasOwnPage(item) ? (
          <FormattedItemDate
            item={item}
            timezone={(item as EventClient).venue?.timezone}
          />
        ) : itemType === EmbeddedItemTypes.publishedEditions ? (
          <time
            dateTime={new Date(
              (item as DashboardPublishedEdition).publishDate
            ).toISOString()}
          >
            {formattedDateTime(
              (item as DashboardPublishedEdition).publishDate,
              'xxs'
            )}
          </time>
        ) : (
          <UsedOnPagesLabel item={item} />
        )}
      </td>

      {children && <td>{children}</td>}
      <td className={styles['table-row-media']}>
        {hasAudio && (
          <SpeakerWaveIcon
            className={styles['media-icon']}
            aria-label='Contains audio'
          />
        )}
        {hasVideo && (
          <VideoCameraIcon
            className={styles['media-icon']}
            aria-label='Contains video'
          />
        )}
        {isEditLinkVisible && (
          <a
            href={`/dashboard/${camelToSnake(itemType)}/${item.id}/edit`}
            className='button-icon button-primary'
            aria-label='Edit'
          >
            <PencilIcon />
          </a>
        )}
      </td>
    </tr>
  )
}
