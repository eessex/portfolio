'use client'

import clsx from 'clsx'
import {
  type JSX,
  useId,
  useState
} from 'react'
import React from 'react'

import styles from '@/ui/form/form.module.scss'

export type InputType = HTMLInputElement | HTMLTextAreaElement

type InputElement = HTMLInputElement | HTMLTextAreaElement
export type InputAttributes<T extends InputElement> =
  T extends HTMLTextAreaElement
    ? React.TextareaHTMLAttributes<T>
    : React.InputHTMLAttributes<T>

export interface InputProps<T extends InputElement> {
  attributes?: InputAttributes<T>
  className?: string
  defaultValue?: string | number
  description?: string
  errors?: string[]
  isLabelHidden?: boolean
  label: string
  onChange?: (event: React.ChangeEvent<T>, isDirty: boolean) => void
  onDrop?: (event: React.DragEvent<T>) => void
  onKeyDown?: (event: React.KeyboardEvent<T>) => void
  onPaste?: (event: React.ClipboardEvent<T>) => void
  ref?: (el: T | null) => void
  value?: string | number
}

export function Input (props: InputProps<HTMLInputElement> & { as?: 'input' }): JSX.Element
export function Input (props: InputProps<HTMLTextAreaElement> & { as: 'textarea' }): JSX.Element
export function Input<T extends InputElement = HTMLInputElement> ({
  as = 'input',
  attributes,
  className,
  defaultValue,
  description,
  errors,
  isLabelHidden,
  label,
  onChange,
  onDrop,
  onKeyDown,
  onPaste,
  ref,
  value
}: InputProps<T> & { as?: 'input' | 'textarea' }) {
  // user has changed value
  const [isDirty, setIsDirty] = useState<boolean>(false)
  // user has blurred or submit occurred
  const [_isTouched, setIsTouched] = useState(false)

  const onBlur = (event: React.FocusEvent<T>) => {
    if (event.target.value !== defaultValue && !isDirty) {
      setIsDirty(true)
    }
    setIsTouched(true)
  }

  const onChangeHandler = (event: React.ChangeEvent<T>) => {
    const changed = event.target.value !== defaultValue
    debugger
    if (!isDirty) {
      // FIXME: confirm handle checked works
      setIsDirty(!!(event.target.value) && changed)
    }
    onChange?.(event, changed)
  }

  const autoId = useId()
  const id = attributes?.id || autoId
  const descriptionId = useId()
  const errorId = useId()
  const isHidden = (attributes as React.InputHTMLAttributes<HTMLInputElement>)?.type === 'hidden'

  const describedby = [description && descriptionId, errors?.length && errorId]
    .filter(Boolean)
    .join(' ') || undefined

  const props = {
    ...attributes,
    className: clsx(className, styles.input, isDirty && 'dirty', errors?.length && 'error'),
    defaultValue,
    onBlur,
    onChange: onChangeHandler,
    onDrop,
    onKeyDown,
    onPaste,
    ref,
    value
  } as Omit<InputProps<T>, 'label'> & { onBlur: (event: React.FocusEvent<T>) => void }
  const inputType = (attributes as React.InputHTMLAttributes<HTMLInputElement>)?.type ?? 'text'

  return (
    <div
      className={props.className}
      hidden={isHidden}
    >
      {!isHidden && (
        <>
          <label
            className={clsx(isLabelHidden && 'visually-hidden')}
            htmlFor={id}
            hidden={isHidden}
          >
            {label}
          </label>

          {description && (
            <p id={descriptionId}>
              {description}
            </p>
          )}
        </>
      )}
      {as === 'textarea'
        ? <textarea
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
          id={id}
          aria-describedby={describedby}
          />
        : <input
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
          id={id}
          aria-describedby={describedby}
          type={inputType}
          />}

      {errors?.length && (
        <p
          id={errorId}
          className={styles['error-message']}
        >
          {errors.join(', ')}.
        </p>
      )}
    </div>
  )
}
