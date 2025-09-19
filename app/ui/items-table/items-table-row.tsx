import type { ReleaseClient } from '@/lib/releases/types'
import type { PageItemClient } from '@/lib/types'
import { DraftBadge } from '@/ui/draft-badge'
import styles from '@/ui/items-table/items-table.module.scss'
import { FormattedItemDate } from '@/ui/items/item-date'
import { clsx } from 'clsx'
import NextImage from 'next/image'
import NextLink from 'next/link'

export function ItemsTableRow ({
  children,
  index,
  isExpanded = false,
  isFeatured = false,
  isPathTypeVisible = false,
  item
}: {
  children?: React.ReactNode,
  index?: number,
  isExpanded?: boolean,
  isFeatured?: boolean,
  isPathTypeVisible?: boolean,
  item: PageItemClient
}) {
  if (!item) return null

  function singularizePath (path: string) {
    return path.endsWith('s') ? path.slice(0, -1) : path
  }

  const linkTarget = `/${item.path}/${item?.slug}`
  const rowLabel = `${item.title}${(item as ReleaseClient).artist ? ', by ' + (item as ReleaseClient).artist : ''}`

  return (
    <tr
      data-index={index}
      className={clsx(styles['table-row-link'], isExpanded && styles['table-row-link--expanded'], isPathTypeVisible && 'item-type-visible')}
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
      {isExpanded && item.coverImage && (
        <td>
          <NextImage
            src={item.coverImage.url}
            alt={item.coverImage.alt || item.coverImage.caption || ''}
            title={item.coverImage.caption || item.coverImage.alt || undefined}
            width={500 * item.coverImage.aspect}
            height={500}
            loading={(index || 0) > 4 ? 'lazy' : undefined}
            priority={!!(isFeatured || (index || 0) < 2)}
            aria-hidden='true'
          />
        </td>
      )}

      {isPathTypeVisible && (
        <td className={styles['table-row-item-type']}>
          {singularizePath(item.path)}
        </td>
      )}

      <td>
        <FormattedItemDate item={item} />
      </td>

      <td className={clsx(styles['table-row-title'], isExpanded && styles['table-row-title--expanded'])}>
        <NextLink
          href={`/${item.path}/${item?.slug}`}
        >
          {(item as ReleaseClient).artist && (item as ReleaseClient).artist + ': '}
          {item.title}{(!item.isPublished && <DraftBadge />)}
        </NextLink>
      </td>

      <td>
        {children}
      </td>
    </tr>
  )
}
