'use client'
import styles from '@/ui/dialog/dialog.module.scss'
import XMarkIcon from '@heroicons/react/24/solid/esm/XMarkIcon'
import { useEffect } from 'react'

export const Dialog = ({
  title,
  children,
  onClose
}: {
  title: string,
  children: React.ReactNode,
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

  return (
    <div
      className={`dialog-container ${styles['dialog-container']}`}
    >
      <div
        className={`dialog ${styles['dialog']}`}
        aria-modal='true'
        role='dialog'
        tabIndex={-1}
      >
        <header className='dialog-header'>
          <h2 className='dialog-title'>{title}</h2>
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
