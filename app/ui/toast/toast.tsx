import { ReactElement, useEffect } from 'react'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import styles from '@/ui/toast/toast.module.scss'
import clsx from 'clsx'

type MessageTypes = 'error' | 'success'

interface ToastProps {
  children?: React.ReactNode;
  type: MessageTypes;
  onHide: () => void;
}

export const Toast = ({ children, type, onHide }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 3000)
    return () => clearTimeout(timer)
  })

  const iconMap: Record<MessageTypes, ReactElement> = {
    success: <CheckCircleIcon />,
    error: <ExclamationCircleIcon />
  }

  const toastIcon = iconMap[type] || null

  const className = clsx(styles.toast, type === 'success' && styles.success, type === 'error' && styles.error)

  function message () {
    if (children) {
      return children
    } else if (type === 'error') {
      return 'An error occurred, please try again.'
    } else if (type === 'success') {
      return 'Saved successfully.'
    }
  }

  return (
    <div
      role='alert'
      aria-live='assertive'
      className={`${className} text-sm font-bold`}
    >
      {toastIcon}
      {message()}
    </div>
  )
}
