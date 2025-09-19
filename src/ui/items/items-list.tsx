import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import { PageItemClient } from '@/lib/types'
import { EventsGridItem } from '@/ui/events-grid/events-grid-item'
import { EventsListItem } from '@/ui/events-list/events-list-item'
import styles from '@/ui/items/items.module.scss'
import { ReleaseGridItem } from '@/ui/release-grid/release-grid-item'
import { ReleaseListItem } from '@/ui/release-list/release-list-item'
import { clsx } from 'clsx'
import { useId } from 'react'

export function ItemsList<T extends PageItemClient> ({
  isExpanded = false,
  isFeatured = false,
  items,
  title
}: {
  isExpanded?: boolean
  isFeatured?: boolean
  items: T[]
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
                ? <ItemGridItem<T> item={item} index={index} isFeatured={isFeatured} />
                : <ItemListItem<T> item={item} index={index} />}
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

function ItemListItem<T extends PageItemClient> ({
  item,
  index
}: {
  item: T
  index: number
}) {
  if (item.path === 'events') {
    return <EventsListItem event={item as EventClient} index={index} />
  } else if (item.path === 'releases') {
    return <ReleaseListItem release={item as ReleaseClient} index={index} />
  }
  return null
}

function ItemGridItem<T extends PageItemClient> ({
  item,
  index,
  isFeatured
}: {
  item: T,
  index: number,
  isFeatured?: boolean
}) {
  if (item.path === 'events') {
    return (
      <EventsGridItem
        event={item as EventClient}
        index={index}
        isUpcoming={isFeatured}
        isTextOnly={isFeatured && index !== 0}
      />
    )
  } else if (item.path === 'releases') {
    return <ReleaseGridItem release={item as ReleaseClient} index={index} />
  }
  return null
}
