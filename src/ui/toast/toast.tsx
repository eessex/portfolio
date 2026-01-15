import { useEffect } from 'react'

import {
  TextBanner,
  type TextBannerProps
} from '@/ui/text-banner/text-banner'
import styles from '@/ui/toast/toast.module.scss'

export interface ToastProps extends Pick<TextBannerProps, 'type'> {
  message: string
  onHide: () => void
}

export const Toast = ({
  message,
  type,
  onHide
}: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 3000)
    return () => clearTimeout(timer)
  })

  return (
    <TextBanner
      type={type}
      className={styles.toast}
    >
      {message}
    </TextBanner>
  )
}
