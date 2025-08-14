'use client'

import { useState, type RefObject, useId } from 'react'
import styles from '@/ui/form/form.module.scss'
import clsx from 'clsx'
import { InputProps } from './input'

export type InputType = HTMLInputElement | HTMLTextAreaElement

interface CheckboxProps extends InputProps {
  isChecked?: boolean,
  attributes: React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  onChange?: (event: React.ChangeEvent<InputType>, isDirty: boolean) => void,
  ref?: (el: InputType) => InputType | null,
}

export const Checkbox = ({
  label,
  className,
  isChecked,
  attributes,
  onChange,
  ref
}: CheckboxProps) => {
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.checked !== isChecked && !isDirty) {
      setIsDirty(true)
    }
  }

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDirty) {
      setIsDirty(event.target.checked !== isChecked)
    }
    onChange?.(event, event.target.checked !== isChecked)
  }

  const autoId = useId()
  const id = attributes.id || autoId
  const isHidden = (attributes as React.InputHTMLAttributes<HTMLInputElement>).type === 'hidden'

  const props = {
    ...attributes,
    checked: isChecked,
    className: clsx(className, styles.input, isDirty && 'dirty', isHidden && 'visually-hidden'),
    onChange: onChangeHandler,
    onBlur
  }

  return (
    <label
      htmlFor={id}
      className={props.className}
    >
      <input
        {...props as React.InputHTMLAttributes<HTMLInputElement>}
        ref={ref as unknown as RefObject<HTMLInputElement>}
        id={id}
        type='checkbox'
      />
      <span>{label}</span>
    </label>
  )
}
