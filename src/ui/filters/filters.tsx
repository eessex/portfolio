import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Children, useEffect, useId, useRef, useState } from 'react'

import { useDevice } from '@/lib/device-context'
import type { EmbeddedItemType, PagePathType } from '@/lib/types'
import styles from '@/ui/filters/filters.module.scss'

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
  const trayId = useId()
  const { isSmBreakpoint } = useDevice()
  const [isOpen, setIsOpen] = useState(false)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const trayRef = useRef<HTMLElement>(null)
  const hasManyChildren = Children.count(children) > 1

  useEffect(() => {
    if (isOpen) {
      trayRef.current?.focus()
    }
  }, [isOpen])

  if (isSmBreakpoint && hasManyChildren) {
    return (
      <div className={clsx(styles['mobile-filters'], isOpen && styles.open, isOpen && 'open')}>
        <button
          ref={openButtonRef}
          aria-haspopup='dialog'
          aria-label={isOpen ? 'Hide filters' : 'Show filters'}
          aria-expanded={isOpen}
          aria-controls={trayId}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <XMarkIcon /> : <MagnifyingGlassIcon />}
        </button>

        <section
          id={trayId}
          role='dialog'
          aria-modal='true'
          aria-labelledby={headingId}
          tabIndex={-1}
          ref={trayRef}
          className={styles['filters-tray']}
        >
          <h2 id={headingId} className='visually-hidden'>
            Filter {itemType}
          </h2>
          <div role='search' aria-controls={controlsId} className={styles['filters-container']}>
            {children}
          </div>
        </section>
      </div>
    )
  } else {
    return (
      <section
        aria-labelledby={headingId}
        className={clsx(styles['filters-section'])}
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
}
