'use client'

import { useState } from 'react'
import styles from '@/ui/form/form.module.scss'
import clsx from 'clsx'

export function Input ({
  label,
  description,
  defaultValue,
  value,
  attributes,
  isTextarea,
  onChange
}: {
  label: string
  description?: string
  defaultValue?: string | number,
  value?: string | number,
  attributes: React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  isTextarea?: boolean
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, isDirty: boolean) => void
}) {
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const onBlur = (event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.target.value !== defaultValue && !isDirty) {
      setIsDirty(true)
    }
  }

  const onChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!isDirty) {
      setIsDirty(event.target.value !== defaultValue)
    }
    onChange?.(event, event.target.value !== defaultValue)
  }

  const isHidden = (attributes as React.InputHTMLAttributes<HTMLInputElement>).type === 'hidden'

  const props = {
    ...attributes,
    defaultValue,
    value,
    className: clsx(styles.input, isDirty && 'dirty'),
    onChange: onChangeHandler,
    onBlur
  }

  return (
    <div>
      {!isHidden && <label>{label}</label>}
      {description && (
        <p>
          {description}
        </p>
      )}
      {isTextarea
        ? <textarea {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} />
        : <input {...props as React.InputHTMLAttributes<HTMLInputElement>} />}
    </div>
  )
}
