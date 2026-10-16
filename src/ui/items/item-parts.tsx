import {
  SpeakerWaveIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import NextImage from 'next/image'

import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import { PagePaths } from '@/lib/schemas'
import type { PageItemClient } from '@/lib/types'
import { DraftBadge } from '@/ui/badges/draft-badge'
import type { ThumbnailImage } from '@/ui/cover-image-thumbnail'
import { formattedItemTitle, formattedItemType } from '@/ui/util'

/** Pieces of a page item shared by `ItemCard` and `ItemsTableRow`. */

/**
 * The item's title, badged while unpublished. With `isBadgeOnImage`
 * the visible badge is the image's (`ItemImageBadge`), so the title
 * keeps the status for screen readers only.
 */
export function ItemTitle({
  item,
  isBadgeOnImage = false
}: {
  item: PageItemClient
  isBadgeOnImage?: boolean
}) {
  return (
    <>
      {formattedItemTitle(item)}
      {!item.isPublished &&
        (isBadgeOnImage ? (
          <span className='visually-hidden'>Unpublished</span>
        ) : (
          <DraftBadge />
        ))}
    </>
  )
}

/** The unpublished badge on an item's image (aria-hidden there). */
export function ItemImageBadge({ item }: { item: PageItemClient }) {
  return item.isPublished ? null : <DraftBadge />
}

/** A release's or project's formatted `type`, if it has one. */
export function itemCategory(item: PageItemClient) {
  const { type } = item as ReleaseClient | ProjectClient
  return type ? formattedItemType(type) : undefined
}

/**
 * A list's cover image, sized by `width` and the image's aspect. The
 * first `priorityBefore` (or a featured one) load with priority; past
 * `lazyAfter` (or with `isLazy`) they load lazily.
 */
export function ItemCoverImage({
  image,
  width,
  sizes,
  index = 0,
  isFeatured = false,
  isLazy = false,
  priorityBefore,
  lazyAfter
}: {
  image: ThumbnailImage
  width: number
  sizes: string
  index?: number
  isFeatured?: boolean
  isLazy?: boolean
  priorityBefore: number
  lazyAfter: number
}) {
  const isPriority = !isLazy && (isFeatured || index < priorityBefore)
  return (
    <NextImage
      src={image.url}
      alt={image.alt || image.caption || ''}
      title={image.caption || image.alt || undefined}
      width={width}
      height={Math.round(width / image.aspect)}
      sizes={sizes}
      loading={isLazy || index > lazyAfter ? 'lazy' : undefined}
      priority={isPriority}
      fetchPriority={isPriority ? 'high' : 'auto'}
      aria-hidden='true'
    />
  )
}

/**
 * Whether a page item has audio/video embeds. A release's audio is
 * the release itself, so it isn't flagged.
 */
export function itemMedia(item: PageItemClient) {
  return {
    hasAudio: item.path !== PagePaths.releases && !!item.hasAudio,
    hasVideo: !!item.hasVideo
  }
}

/** The audio/video icons for an item's embeds. */
export function ItemMediaIcons({
  hasAudio,
  hasVideo
}: {
  hasAudio: boolean
  hasVideo: boolean
}) {
  return (
    <>
      {hasAudio && <SpeakerWaveIcon aria-label='Contains audio' />}
      {hasVideo && <VideoCameraIcon aria-label='Contains video' />}
    </>
  )
}
