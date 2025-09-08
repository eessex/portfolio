import type { PageType, ReleaseClient } from '@/lib/definitions'
import type { EventClient } from '@/lib/events/types'
import { EventsGridItem } from '@/ui/events-grid/events-grid-item'
import { EventsListItem } from '@/ui/events-list/events-list-item'
import styles from '@/ui/items/items.module.scss'
import { ReleaseGridItem } from '@/ui/release-grid/release-grid-item'
import { ReleaseListItem } from '@/ui/release-list/release-list-item'
import { clsx } from 'clsx'
import { useId } from 'react'

export function ItemsList<T extends EventClient | ReleaseClient> ({
  isExpanded = false,
  isFeatured = false,
  items,
  itemType,
  title
}: {
  isExpanded?: boolean
  isFeatured?: boolean
  items: T[]
  itemType: PageType
  title?: string
}) {
  const headingId = useId()
  function List () {
    if (items.length === 0) {
      return <p>No items found.</p>
    } else {
      return (
        <ul className={clsx((isExpanded || isFeatured) ? styles['items-grid'] : styles['items-list'])}>
          {items.map((item, index) => (
            <li key={item.id}>
              {(isExpanded || isFeatured)
                ? <ItemGridItem<T> item={item} index={index} itemType={itemType} isFeatured={isFeatured} />
                : <ItemListItem<T> item={item} index={index} itemType={itemType} />}
            </li>
          ))}
        </ul>
      )
    }
  }

  if (title) {
    return (
      <section
        aria-labelledby={headingId}
        className={clsx(isFeatured && styles.upcoming)}
      >
        <header className={styles['items-section-header']}>
          <h2 id={headingId}>{title}</h2>
        </header>
        <List />
      </section>
    )
  } else {
    return (
      <List />
    )
  }
}

function ItemListItem<T extends EventClient | ReleaseClient> ({
  item,
  index,
  itemType
}: {
  item: T
  index: number
  itemType: PageType
}) {
  if (itemType === 'event') {
    return <EventsListItem event={item as EventClient} index={index} />
  } else if (itemType === 'release') {
    return <ReleaseListItem release={item as ReleaseClient} index={index} />
  }
  return null
}

function ItemGridItem<T extends EventClient | ReleaseClient> ({
  item,
  index,
  itemType,
  isFeatured
}: {
  item: T,
  index: number,
  itemType: PageType,
  isFeatured?: boolean
}) {
  if (itemType === 'event') {
    return (
      <EventsGridItem
        event={item as EventClient}
        index={index}
        isUpcoming={isFeatured}
        isTextOnly={isFeatured && index !== 0}
      />
    )
  } else if (itemType === 'release') {
    return <ReleaseGridItem release={item as ReleaseClient} index={index} />
  }
  return null
}
