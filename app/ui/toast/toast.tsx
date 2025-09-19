import { useEffect } from 'react'

import { TextBanner, type TextBannerProps } from '@/ui/text-banner/text-banner'
import styles from '@/ui/toast/toast.module.scss'

interface ToastProps extends TextBannerProps {
  onHide: () => void
}

export const Toast = ({ children, type, onHide }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 3000)
    return () => clearTimeout(timer)
  })

  return (
    <TextBanner type={type} className={styles.toast}>
      {children}
    </TextBanner>
  )
}
