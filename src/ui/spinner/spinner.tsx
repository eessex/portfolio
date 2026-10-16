import { clsx } from 'clsx'

import styles from '@/ui/spinner/spinner.module.scss'

/**
 * A spinning ring announced as `label` to screen readers. With
 * `isCentered` it sits over the middle of its nearest positioned
 * ancestor (e.g. over an image while it loads).
 */
export function Spinner({
  label = 'Loading',
  isCentered = false,
  className
}: {
  label?: string
  isCentered?: boolean
  className?: string
}) {
  return (
    <span
      className={clsx(
        styles.spinner,
        isCentered && styles.centered,
        className
      )}
      role='status'
    >
      <span className='visually-hidden'>{label}</span>
    </span>
  )
}
