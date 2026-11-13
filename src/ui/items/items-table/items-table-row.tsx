import { clsx } from 'clsx'
import NextLink from 'next/link'

import type { WithCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import {
  type EmbedCode,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import type { Image } from '@/lib/images/schemas/db'
import { imageAspect, MOBILE_CONTENT_SIZE } from '@/lib/images/util'
import type { Link } from '@/lib/links/schemas/db'
import type { Publisher } from '@/lib/publishers/schemas/db'
import type { ReleaseClient } from '@/lib/releases/types'
import {
  type EmbeddedItemType,
  EmbeddedItemTypes,
  type PagePath
} from '@/lib/schemas'
import type { EmbeddedItem, PageItemClient } from '@/lib/types'
import type { Venue } from '@/lib/venues/schemas/db'
import type { ThumbnailImage } from '@/ui/cover-image-thumbnail'
import { formattedEmbedCodeTitle } from '@/ui/embed-codes/embed-code-details'
import { coverImageAspectByHost } from '@/ui/embed-codes/util'
import { formattedItemType } from '@/ui/format/items'
import { formattedFilename, formattedLinkUrl } from '@/ui/format/urls'
import { FormattedItemDate } from '@/ui/items/item-date'
import {
  itemCategory,
  ItemCoverImage,
  ItemImageBadge,
  itemMedia,
  ItemMediaIcons,
  ItemTitle
} from '@/ui/items/item-parts'
import { isImageColumnVisible } from '@/ui/items/items-table/columns'
import styles from '@/ui/items/items-table/items-table.module.scss'
import {
  dashboardItemEditUrl,
  itemUrl,
  usedOnPages
} from '@/ui/routes'
import { formatVenueInline } from '@/ui/venues/format-venue-inline'

function embeddedItemTitle(
  item: EmbeddedItem,
  itemType: PagePath | EmbeddedItemType
) {
  if (itemType === EmbeddedItemTypes.venues) {
    return (item as Venue).name || 'Untitled venue'
  }

  if (itemType === EmbeddedItemTypes.publishers) {
    return (item as Publisher).name
  }

  if (itemType === EmbeddedItemTypes.links) {
    const link = item as Link
    const title = link.title || formattedLinkUrl(link.url)
    return link.attribution
      ? `${title} in ${link.attribution}`
      : title
  }

  if (itemType === EmbeddedItemTypes.images) {
    const image = item as Image
    return image.title || formattedFilename(image.url)
  }

  return formattedEmbedCodeTitle(item as EmbedCode)
}

function embeddedItemSubtitle(
  item: EmbeddedItem,
  itemType: PagePath | EmbeddedItemType
) {
  if (itemType === EmbeddedItemTypes.venues) {
    return formatVenueInline({
      venue: item as Venue,
      isNameHidden: true
    })
  }

  if (itemType === EmbeddedItemTypes.links) {
    const link = item as Link
    return link.title ? formattedLinkUrl(link.url) : undefined
  }

  if (itemType === EmbeddedItemTypes.publishers) {
    const publisher = item as Publisher
    return publisher.url ? formattedLinkUrl(publisher.url) : undefined
  }

  return (item as EmbedCode).caption
}

function embeddedItemCoverImage(
  item: EmbeddedItem,
  itemType: PagePath | EmbeddedItemType
): ThumbnailImage | undefined {
  if (itemType === EmbeddedItemTypes.embedCodes) {
    const embedCode = item as EmbedCode & WithCoverImageUrls
    const embedCodeImageUrl =
      embedCode.coverImageThumbnailUrl || embedCode.coverImageUrl
    return embedCodeImageUrl
      ? {
          url: embedCodeImageUrl,
          aspect: coverImageAspectByHost(embedCode.host)
        }
      : undefined
  }

  if (itemType === EmbeddedItemTypes.images) {
    return item as Image
  }

  return undefined
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
  isDateHidden = false,
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
  /** leave the date cell empty, e.g. a label's roster (`/artists`) */
  isDateHidden?: boolean
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

  const {
    artist,
    displayArtist = artist,
    coverImage
  } = item as ReleaseClient
  const itemSubtitle = embeddedItemSubtitle(
    item as EmbeddedItem,
    itemType
  )
  const embedCode = item as EmbedCode & WithCoverImageUrls
  const rowCoverImage: ThumbnailImage | undefined =
    (hasOwnPage(item) && coverImage) ||
    embeddedItemCoverImage(item as EmbeddedItem, itemType)
  const linkTarget = hasOwnPage(item)
    ? itemUrl(item)
    : isAdmin
      ? dashboardItemEditUrl(itemType as EmbeddedItemType, item.id)
      : undefined
  const rowLabel = hasOwnPage(item)
    ? `${item.title}${displayArtist ? ', by ' + displayArtist : ''}`
    : undefined
  const isAudioEmbedCode =
    itemType === EmbeddedItemTypes.embedCodes &&
    embedCode.type === EmbedCodeTypes.audio
  const isVideoEmbedCode =
    itemType === EmbeddedItemTypes.embedCodes &&
    embedCode.type === EmbedCodeTypes.video
  const media = hasOwnPage(item) ? itemMedia(item) : undefined
  const isAudio = !!media?.isAudio || isAudioEmbedCode
  const isVideo = !!media?.isVideo || isVideoEmbedCode
  const isImageVisible = isImageColumnVisible(itemType)

  return (
    <tr
      data-index={index}
      // sizes an expanded card in its justified row; a placeholder is
      // square. The name morphs the card when drafts reflow the rows
      style={
        isExpanded
          ? ({
              '--aspect': rowCoverImage
                ? imageAspect(rowCoverImage)
                : 1,
              viewTransitionName: `item-${item.id}`
            } as React.CSSProperties)
          : undefined
      }
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
            <ItemCoverImage
              image={rowCoverImage}
              width={350}
              sizes={
                isExpanded
                  ? `(max-width: 768px) ${MOBILE_CONTENT_SIZE}, 50vw`
                  : '(max-width: 768px) 92px, 52px'
              }
              index={index}
              isFeatured={isFeatured}
              priorityBefore={12}
              lazyAfter={12}
            />
          )}
          {isExpanded && hasOwnPage(item) && (
            <ItemImageBadge item={item} />
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
            {isCategoryVisible && itemCategory(item) && (
              <span className={styles['item-type'] + ' category'}>
                {itemCategory(item)}
              </span>
            )}
            <span className={styles['title-text']}>
              <ItemTitle item={item} isBadgeOnImage={isExpanded} />
            </span>
          </NextLink>
        ) : (
          <div className={styles['item-title-stack']}>
            <span>{embeddedItemTitle(item, itemType)}</span>
            {itemSubtitle && (
              <span className={styles['item-title-stack-subtitle']}>
                {itemSubtitle}
              </span>
            )}
          </div>
        )}
      </td>

      <td>
        {hasOwnPage(item) ? (
          !isDateHidden && <FormattedItemDate item={item} />
        ) : (
          <UsedOnPagesLabel item={item} />
        )}
      </td>

      {children && <td>{children}</td>}
      <td className={styles['table-row-media']}>
        <ItemMediaIcons isAudio={isAudio} isVideo={isVideo} />
      </td>
    </tr>
  )
}
