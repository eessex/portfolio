import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import {
  useEffect,
  useId,
  useRef,
  useState
} from 'react'

import { useDevice } from '@/lib/device-context'
import type { EmbeddedItemType, PagePathType } from '@/lib/types'
import styles from '@/ui/filters/filters.module.scss'

type FiltersWrapperProps = {
  children?: React.ReactNode
  controlsId: string
  itemType: PagePathType | EmbeddedItemType
}

export function FiltersWrapper ({ controlsId, itemType, children }: FiltersWrapperProps) {
  const { isSmBreakpoint } = useDevice()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const FiltersComponent = isSmBreakpoint
    ? FiltersContainerMobile
    : FiltersContainerDesktop

  return (
    <FiltersComponent
      itemType={itemType}
      controlsId={controlsId}
    >
      {children}
    </FiltersComponent>
  )
}

export function FiltersContainerDesktop ({
  children,
  controlsId,
  itemType
}: FiltersWrapperProps) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={clsx(styles['filters-section'])}
    >
      <h2
        id={headingId}
        className='visually-hidden'
      >
        Filter {itemType}
      </h2>
      <div
        role='search'
        aria-controls={controlsId}
        className={styles['filters-container']}
      >
        {children}
      </div>
    </section>
  )
}

export function FiltersContainerMobile ({
  children,
  controlsId,
  itemType
}: FiltersWrapperProps) {
  const headingId = useId()
  const trayId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const trayRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isOpen) {
      trayRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div className={clsx(styles['filters-tray'], isOpen && styles.open, isOpen && 'open')}>
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
        <h2
          id={headingId}
          className='visually-hidden'
        >
          Filter {itemType}
        </h2>
        <div
          role='search'
          aria-controls={controlsId}
          className={styles['filters-container']}
        >
          {children}
        </div>
      </section>
    </div>
  )
}
