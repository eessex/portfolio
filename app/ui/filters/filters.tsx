import type { EmbeddedItemType, PagePathType } from '@/lib/types'
import styles from '@/ui/filters/filters.module.scss'
import { clsx } from 'clsx'
import { Children, useId } from 'react'

export function FiltersContainer ({
  children,
  controlsId,
  itemType
}: {
  children?: React.ReactNode
  controlsId: string
  itemType: PagePathType | EmbeddedItemType
}) {
  const headingId = useId()
  const hasManyChildren = Children.count(children) > 2

  return (
    <section
      aria-labelledby={headingId}
      className={clsx(styles['filters-section'], { [styles['many-children']]: hasManyChildren })}
    >
      <h2 id={headingId} className='visually-hidden'>
        Filter {itemType}
      </h2>
      <div
        role='search' aria-controls={controlsId}
        className={styles['filters-container']}
      >
        {children}
      </div>
    </section>
  )
}
