import { clsx } from 'clsx'
import { useId } from 'react'

import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import { PagePaths } from '@/lib/schemas'
import type { PageItemClient } from '@/lib/types'
import { TicketButton } from '@/ui/buttons/ticket-button'
import { ItemCard } from '@/ui/items/item-card'
import styles from '@/ui/items/items.module.scss'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import { formatVenueInline } from '@/ui/util'

export function ItemsList({
  isCategoryVisible = false,
  isFeatured = false,
  isTextOnly = false,
  items,
  title,
  className
}: {
  isCategoryVisible?: boolean
  isFeatured?: boolean
  isTextOnly?: boolean
  items: PageItemClient[]
  title?: string
  className?: string
}) {
  const headingId = useId()

  if (items.length === 0) return null

  const list = (
    <ul
      className={clsx(
        styles['items-grid'],
        isFeatured && styles['items-grid-featured'],
        className
      )}
    >
      {items.map((item, index) => (
        <li key={item.id}>
          <ItemGridItem
            item={item}
            index={index}
            isCategoryVisible={isCategoryVisible}
            isFeatured={isFeatured}
            isTextOnly={isTextOnly}
          />
        </li>
      ))}
    </ul>
  )

  if (title) {
    return (
      <section
        aria-labelledby={headingId}
        className={clsx(isFeatured && styles.upcoming)}
      >
        <header className={styles['items-section-header']}>
          <h2 id={headingId}>{title}</h2>
        </header>
        {list}
      </section>
    )
  } else {
    return list
  }
}

function ItemGridItem({
  item,
  index,
  isCategoryVisible,
  isFeatured,
  isTextOnly
}: {
  item: PageItemClient
  index: number
  isCategoryVisible?: boolean
  isFeatured?: boolean
  isTextOnly?: boolean
}) {
  const { publishedEditions } = item as ReleaseClient
  const { ticketLink, venue } = item as EventClient
  switch (item.path) {
    case PagePaths.events:
      return (
        <ItemCard
          item={item}
          index={index}
          isCategoryVisible={isCategoryVisible}
          isFeatured={isFeatured}
          isTextOnly={isTextOnly}
          externalLink={
            ticketLink && <TicketButton url={ticketLink} />
          }
        >
          {venue && (
            <p className={styles['card-item-venue']}>
              {formatVenueInline({ venue })}
            </p>
          )}
        </ItemCard>
      )
    case PagePaths.releases:
      return (
        <ItemCard
          item={item}
          index={index}
          isCategoryVisible={isCategoryVisible}
          isFeatured={isFeatured}
        >
          {publishedEditions && (
            <PublishedEditionsCombined
              publishedEditions={publishedEditions}
            />
          )}
        </ItemCard>
      )
    default:
      return (
        <ItemCard
          item={item}
          index={index}
          isCategoryVisible={isCategoryVisible}
        />
      )
  }
}
