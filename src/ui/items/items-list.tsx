import { TicketIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useId } from 'react'

import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageItemClient } from '@/lib/types'
import { ItemCard } from '@/ui/items/item-card'
import styles from '@/ui/items/items.module.scss'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import { formattedDateTime } from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'

export function ItemsList ({
  isFeatured = false,
  isTextOnly = false,
  items,
  title
}: {
  isFeatured?: boolean
  isTextOnly?: boolean
  items: PageItemClient[]
  title?: string
}) {
  const headingId = useId()

  if (items.length === 0) return null

  function List () {
    return (
      <ul className={clsx(styles['items-grid'], isFeatured && styles['items-grid-featured'])}>
        {items.map((item, index) => (
          <li key={item.id}>
            <ItemGridItem
              item={item}
              index={index}
              isFeatured={isFeatured}
              isTextOnly={isTextOnly}
            />
          </li>
        ))}
      </ul>
    )
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

function ItemGridItem ({
  item,
  index,
  isFeatured,
  isTextOnly
}: {
  item: PageItemClient
  index: number
  isFeatured?: boolean
  isTextOnly?: boolean
}) {
  switch (item.path) {
    case 'events':
      return (
        <ItemCard
          item={item}
          index={index}
          isFeatured={isFeatured}
          isTextOnly={isTextOnly}
          externalLink={item.ticketLink && (
            <a className={clsx('button', styles['card-ticket-link'])} href={item.ticketLink} target='_blank' rel='noreferrer'>
              <TicketIcon />Tickets
            </a>
          )}
        >
          <h4>
            {formattedDateTime((item as EventClient).startTime)}
          </h4>

          {(item as EventClient).venue && (
            <h5>
              <VenueInline venue={(item as EventClient).venue!} />
            </h5>
          )}
        </ItemCard>
      )
    case 'releases':
      return (
        <ItemCard
          item={item}
          index={index}
          isFeatured={isFeatured}
        >
          {(item as ReleaseClient).publishedEditions && (
            <PublishedEditionsCombined publishedEditions={(item as ReleaseClient).publishedEditions} />
          )}
        </ItemCard>
      )
    default:
      return <ItemCard item={item} index={index} />
  }
}
