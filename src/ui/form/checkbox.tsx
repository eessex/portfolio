'use client'

import clsx from 'clsx'
import { useId, useState } from 'react'

import styles from '@/ui/form/form.module.scss'
import type { InputProps } from '@/ui/form/input'

interface CheckboxProps extends Omit<
  InputProps<HTMLInputElement>,
  'isLabelHidden' | 'as'
> {
  controlledId?: string
  /** Initial state of the (uncontrolled) checkbox. */
  isDefaultChecked?: boolean
}

export const Checkbox = ({
  attributes,
  className,
  controlledId,
  isDefaultChecked = false,
  label,
  onChange
}: CheckboxProps) => {
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const onChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChanged = event.target.checked !== isDefaultChecked
    if (isChanged) setIsDirty(true)
    onChange?.(event, isChanged)
  }

  const autoId = useId()
  const id = attributes?.id || autoId
  const isHidden = attributes?.hidden === true

  const props = {
    ...attributes,
    type: 'checkbox',
    defaultChecked: isDefaultChecked,
    className: clsx(className, styles.input, isDirty && 'dirty'),
    onChange: onChangeHandler
  }

  return (
    <label
      htmlFor={id}
      className={props.className}
      hidden={isHidden}
      id={controlledId}
    >
      <input {...props} id={id} />
      <span>{label}</span>
    </label>
  )
}
