import clsx from 'clsx'
import { useState } from 'react'

export function Input ({
  label,
  description,
  defaultValue,
  value,
  attributes,
  onChange
}: {
  label: string
  description?: string
  defaultValue?: string | number,
  value?: string | number,
  attributes: React.InputHTMLAttributes<HTMLTextAreaElement | HTMLInputElement>,
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

  const props = {
    ...attributes,
    defaultValue,
    value,
    className: clsx(isDirty && 'dirty'),
    onChange: onChangeHandler,
    onBlur
  }

  return (
    <div>
      <label>{label}</label>
      {description && (
        <p>
          {description}
        </p>
      )}
      {attributes?.type === 'textarea'
        ? <textarea {...props} />
        : <input {...props} />}
    </div>
  )
}
