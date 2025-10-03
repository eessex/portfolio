import { clsx } from 'clsx'
import NextImage from 'next/image'
import NextLink from 'next/link'

import type { EventClient } from '@/lib/events/types'
import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageItemClient } from '@/lib/types'
import { DraftBadge } from '@/ui/draft-badge'
import { FormattedItemDate } from '@/ui/items/item-date'
import styles from '@/ui/items/items-table/items-table.module.scss'
import {
  formattedItemTitle,
  formattedItemType,
  itemUrl
} from '@/ui/util'

export function ItemsTableRow ({
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

  const {
    artist,
    coverImage
  } = item as ReleaseClient
  const linkTarget = itemUrl(item)
  const rowLabel = `${item.title}${artist ? ', by ' + artist : ''}`

  return (
    <tr
      data-index={index}
      className={clsx(styles['table-row-link'], isExpanded && styles['table-row-link--expanded'], isCategoryVisible && 'item-type-visible')}
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
      {isExpanded && coverImage && (
        <td className={styles['table-row-img']}>
          <NextImage
            src={coverImage.url}
            alt={coverImage.alt || coverImage.caption || ''}
            title={coverImage.caption || coverImage.alt || undefined}
            width={350}
            height={350 / coverImage.aspect}
            loading={(index || 0) > 4 ? 'lazy' : undefined}
            priority={!!(isFeatured || (index || 0) < 2)}
            aria-hidden='true'
          />
        </td>
      )}

      {isPathTypeVisible && (
        <td className='category path-type'>
          {formattedItemType(item.path)}
        </td>
      )}

      <td>
        <FormattedItemDate
          item={item}
          timezone={(item as EventClient).venue?.timezone}
        />
      </td>

      <td className={clsx(styles['table-row-title'], isExpanded && styles['table-row-title--expanded'])}>
        <NextLink href={linkTarget}>
          {formattedItemTitle(item)}
          {!item.isPublished && <DraftBadge />}
        </NextLink>
      </td>

      {children && (
        <td>
          {children}
        </td>
      )}

      {isCategoryVisible && (item as ReleaseClient | ProjectClient).type && (
        <td className={styles['item-type'] + ' category'}>
          {formattedItemType((item as ReleaseClient | ProjectClient).type!)}
        </td>
      )}
    </tr>
  )
}
