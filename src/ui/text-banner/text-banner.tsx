import { ReactElement } from 'react'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import styles from '@/ui/text-banner/text-banner.module.scss'
import clsx from 'clsx'

type MessageTypes = 'error' | 'success'

export interface TextBannerProps {
  children?: React.ReactNode;
  className?: string;
  type: MessageTypes;
}

export const TextBanner = ({ children, type, className }: TextBannerProps) => {
  const iconMap: Record<MessageTypes, ReactElement> = {
    success: <CheckCircleIcon />,
    error: <ExclamationCircleIcon />
  }

  const icon = iconMap[type] || null

  const classes = clsx(styles['text-banner'], className, type === 'success' && styles.success, type === 'error' && styles.error)

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
    // FIXME: determine appropriate roles
    // aria-live='polite'
    // aria-atomic='true'
    <div
      role='alert'
      aria-live='assertive'
      className={classes}
    >
      {icon}
      {message()}
    </div>
  )
}
