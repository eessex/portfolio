import { useEffect } from 'react'
import styles from '@/ui/toast/toast.module.scss'
import { TextBanner, type TextBannerProps } from '@/ui/text-banner/text-banner'

interface ToastProps extends TextBannerProps {
  onHide: () => void;
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
