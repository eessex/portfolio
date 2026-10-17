'use client'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useId, useRef } from 'react'

import styles from '@/ui/dialog/dialog.module.scss'
import { useModalDialog } from '@/ui/dialog/use-modal-dialog'

export const Dialog = ({
  cancelButtonText,
  children,
  confirmButtonText,
  isLoading,
  title,
  onClose,
  onConfirm
}: {
  cancelButtonText?: string
  children: React.ReactNode
  confirmButtonText: string
  isLoading?: boolean
  title: string
  onClose: () => void
  onConfirm: () => void
}) => {
  const dialogTitleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useModalDialog({
    onClose,
    initialFocusRef: cancelRef
  })

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={dialogTitleId}
      className={styles['dialog-container']}
    >
      <div className={`dialog ${styles['dialog']}`}>
        <header className='dialog-header'>
          <h2 id={dialogTitleId}>{title}</h2>
          <button
            className='button-icon'
            aria-label='Close dialog'
            onClick={onClose}
          >
            <span className='visually-hidden'>Close</span>
            <XMarkIcon />
          </button>
        </header>

        <div className={styles['dialog-content']}>{children}</div>

        <footer className={styles['dialog-footer']}>
          {confirmButtonText && (
            <button
              type='button'
              className={`button-primary button-lg ${styles['dialog-confirm-button']}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {confirmButtonText}
            </button>
          )}
          {cancelButtonText && (
            <button
              ref={cancelRef}
              type='button'
              className='button-sm'
              onClick={onClose}
            >
              {cancelButtonText}
            </button>
          )}
        </footer>
      </div>
    </dialog>
  )
}
