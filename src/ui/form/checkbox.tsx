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
  isChecked?: boolean
}

export const Checkbox = ({
  attributes,
  className,
  controlledId,
  isChecked,
  label,
  onChange
}: CheckboxProps) => {
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.checked !== isChecked && !isDirty) {
      setIsDirty(true)
    }
  }

  const onChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isDirty) {
      setIsDirty(event.target.checked !== isChecked)
    }
    onChange?.(event, event.target.checked !== isChecked)
  }

  const autoId = useId()
  const id = attributes?.id || autoId
  const isHidden = attributes?.hidden === true

  const props = {
    ...attributes,
    type: 'checkbox',
    checked: isChecked,
    className: clsx(className, styles.input, isDirty && 'dirty'),
    onChange: onChangeHandler,
    onBlur
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
