'use client'
import XMarkIcon from '@heroicons/react/24/solid/esm/XMarkIcon'
import {
  useEffect,
  useId
} from 'react'

import styles from '@/ui/dialog/dialog.module.scss'

export const Dialog = ({
  title,
  children,
  onClose
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(`Key pressed: ${event.key}`)
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const dialogTitleId = useId()

  return (
    <div
      className={`dialog-container ${styles['dialog-container']}`}
    >
      <div
        aria-labelledby={dialogTitleId}
        className={`dialog ${styles['dialog']}`}
        aria-modal='true'
        role='dialog'
        tabIndex={-1}
      >
        <header className='dialog-header'>
          <h2 id={dialogTitleId}>{title}</h2>
          <button
            className='icon-button'
            aria-label='Close dialog'
            onClick={onClose}
          >
            <span className='visually-hidden'>Close</span>
            <XMarkIcon />
          </button>
        </header>

        <div className={styles['dialog-content']}>
          {children}
          <slot />
        </div>
      </div>
    </div>
  )
}
