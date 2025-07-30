'use client'

import { useState, type RefObject, useId } from 'react'
import styles from '@/ui/form/form.module.scss'
import clsx from 'clsx'

export type InputType = HTMLInputElement | HTMLTextAreaElement

interface InputProps {
  label: string
  className?: string,
  description?: string
  defaultValue?: string | number,
  value?: string | number,
  attributes: React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  isLabelHidden?: boolean
  isTextarea?: boolean
  onChange?: (event: React.ChangeEvent<InputType>, isDirty: boolean) => void,
  ref?: (el: InputType) => InputType | null,
  children?: React.ReactNode
}

export const Input = ({
  label,
  className,
  description,
  defaultValue,
  value,
  attributes,
  isLabelHidden,
  isTextarea,
  onChange,
  ref,
  children
}: InputProps) => {
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const onBlur = (event: React.FocusEvent<InputType>) => {
    if (event.target.value !== defaultValue && !isDirty) {
      setIsDirty(true)
    }
  }

  const onChangeHandler = (event: React.ChangeEvent<InputType>) => {
    if (!isDirty) {
      setIsDirty(event.target.value !== defaultValue)
    }
    onChange?.(event, event.target.value !== defaultValue)
  }

  const autoId = useId()
  const id = attributes.id || autoId
  const isHidden = (attributes as React.InputHTMLAttributes<HTMLInputElement>).type === 'hidden'

  const props = {
    ...attributes,
    defaultValue,
    value,
    className: clsx(className, styles.input, isDirty && 'dirty', isHidden && 'visually-hidden'),
    onChange: onChangeHandler,
    onBlur
  }

  return (
    <div className={props.className}>
      {!isHidden && (
        <label
          className={clsx(isLabelHidden && 'visually-hidden')}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      {description && (
        <p>
          {description}
        </p>
      )}
      {isTextarea
        ? <textarea
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
          ref={ref as unknown as RefObject<HTMLTextAreaElement>}
          id={id}
          />
        : <input
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
          ref={ref as unknown as RefObject<HTMLInputElement>}
          id={id}
          />}
      {children}
    </div>
  )
}
