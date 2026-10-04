import clsx from 'clsx'

import styles from '@/ui/form/form.module.scss'

type InputLabelProps = {
  isHidden?: boolean
  isVisuallyHidden?: boolean
  isRequired?: boolean
  /**
   * Omits the "optional" suffix from a not-`required` field whose
   * requiredness is conditional (it's only optional until something
   * else is filled in), so the suffix doesn't flicker or mislead.
   */
  isOptionalLabelHidden?: boolean
  label: string
  description?: string
  descriptionId?: string
} & ({ as?: 'label'; htmlFor?: string } | { as: 'legend' })

export function InputLabel(props: InputLabelProps) {
  const {
    isHidden,
    isVisuallyHidden,
    isRequired,
    isOptionalLabelHidden,
    label,
    description,
    descriptionId
  } = props

  const className = clsx(isVisuallyHidden && 'visually-hidden')
  const text = (
    <>
      {label}
      {!isRequired && !isOptionalLabelHidden && (
        <>
          {' '}
          <span className={styles['optional-label']}>optional</span>
        </>
      )}
    </>
  )

  return (
    <>
      {props.as === 'legend' ? (
        <legend className={className} hidden={isHidden}>
          {text}
        </legend>
      ) : (
        <label
          className={className}
          htmlFor={props.htmlFor}
          hidden={isHidden}
        >
          {text}
        </label>
      )}
      {description && <p id={descriptionId}>{description}</p>}
    </>
  )
}
