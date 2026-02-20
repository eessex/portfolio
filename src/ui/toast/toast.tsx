import {
  TextBanner,
  type TextBannerProps
} from '@/ui/text-banner/text-banner'
import styles from '@/ui/toast/toast.module.scss'

export interface ToastProps extends Pick<TextBannerProps, 'type'> {
  message: string
}

export const Toast = ({
  message,
  type
}: ToastProps) => {
  const role =
    type === 'error'
      ? 'alert'
      : 'status'

  return (
    <TextBanner
      type={type}
      className={styles.toast}
      role={role}
    >
      {message}
    </TextBanner>
  )
}
