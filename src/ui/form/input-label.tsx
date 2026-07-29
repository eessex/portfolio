import clsx from 'clsx'

import styles from '@/ui/form/form.module.scss'

export function InputLabel({
  isHidden,
  htmlFor,
  isVisuallyHidden,
  isRequired,
  label
}: {
  isHidden?: boolean
  htmlFor: string
  isVisuallyHidden?: boolean
  isRequired?: boolean
  label: string
}) {
  return (
    <label
      className={clsx(isVisuallyHidden && 'visually-hidden')}
      htmlFor={htmlFor}
      hidden={isHidden}
    >
      {label}
      {!isRequired && (
        <>
          {' '}
          <span className={styles['optional-label']}>optional</span>
        </>
      )}
    </label>
  )
}
