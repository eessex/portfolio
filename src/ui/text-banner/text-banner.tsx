import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import type { ReactElement } from 'react'

import styles from '@/ui/text-banner/text-banner.module.scss'

type MessageTypes = 'error' | 'success'

export interface TextBannerProps {
  children?: React.ReactNode
  className?: string
  role?: React.AriaRole
  type: MessageTypes
}

export const TextBanner = ({
  children,
  className,
  role,
  type
}: TextBannerProps) => {
  const iconMap: Record<MessageTypes, ReactElement> = {
    success: <CheckCircleIcon />,
    error: <ExclamationCircleIcon />
  }

  const icon = iconMap[type] || null

  const classes = clsx(
    styles['text-banner'],
    className,
    type === 'success' && styles.success,
    type === 'error' && styles.error
  )

  function message() {
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
      role={role}
      aria-atomic={role ? 'true' : undefined}
      className={classes}
    >
      {icon}
      {message()}
    </div>
  )
}
