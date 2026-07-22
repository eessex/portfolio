import {
  SpeakerWaveIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import NextImage from 'next/image'
import NextLink from 'next/link'

import type { EventClient } from '@/lib/events/types'
import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import { PagePaths } from '@/lib/schemas'
import type { PageItemClient } from '@/lib/types'
import { DraftBadge } from '@/ui/draft-badge'
import { FormattedItemDate } from '@/ui/items/item-date'
import styles from '@/ui/items/items-table/items-table.module.scss'
import {
  formattedItemTitle,
  formattedItemType,
  itemUrl
} from '@/ui/util'

export function ItemsTableRow({
  children,
  index,
  isCategoryVisible = false,
  isExpanded = false,
  isFeatured = false,
  isPathTypeVisible = false,
  item
}: {
  children?: React.ReactNode
  index?: number
  isCategoryVisible?: boolean
  isExpanded?: boolean
  isFeatured?: boolean
  isPathTypeVisible?: boolean
  item: PageItemClient
}) {
  if (!item) return null

  const { artist, coverImage } = item as ReleaseClient
  const linkTarget = itemUrl(item)
  const rowLabel = `${item.title}${artist ? ', by ' + artist : ''}`
  const isPriorityImage = !!(isFeatured || (index || 0) < 12)
  const imageWidth = 350
  const hasAudio = item.path !== PagePaths.releases && !!item.hasAudio

  return (
    <tr
      data-index={index}
      className={clsx(
        styles['table-row-link'],
        isExpanded && styles['table-row-link--expanded'],
        isPathTypeVisible && styles['item-type-visible']
      )}
      onClick={() => location.assign(linkTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          location.assign(linkTarget)
        }
      }}
      tabIndex={0}
      role='link'
      aria-label={rowLabel}
    >
      <td className={styles['table-row-img']} aria-hidden='true'>
        {coverImage && (
          <NextImage
            src={coverImage.url}
            alt={coverImage.alt || coverImage.caption || ''}
            title={coverImage.caption || coverImage.alt || undefined}
            width={imageWidth}
            height={Math.round(imageWidth / coverImage.aspect)}
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

      {isPathTypeVisible && (
        <td className='category path-type'>
          {formattedItemType(item.path)}
        </td>
      )}

      <td
        className={clsx(
          styles['table-row-title'],
          isExpanded && styles['table-row-title--expanded']
        )}
      >
        <NextLink href={linkTarget}>
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
      </td>

      <td>
        <FormattedItemDate
          item={item}
          timezone={(item as EventClient).venue?.timezone}
        />
      </td>

      {children && <td>{children}</td>}
      <td className={styles['table-row-media']}>
        {hasAudio && (
          <SpeakerWaveIcon
            className={styles['media-icon']}
            aria-label='Contains audio'
          />
        )}
        {!!item.hasVideo && (
          <VideoCameraIcon
            className={styles['media-icon']}
            aria-label='Contains video'
          />
        )}
      </td>
    </tr>
  )
}
