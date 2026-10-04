'use client'

import clsx from 'clsx'
import { type JSX, useId, useState } from 'react'
import React from 'react'

import styles from '@/ui/form/form.module.scss'
import { InputLabel } from '@/ui/form/input-label'

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
  /** See `InputLabel`'s `isOptionalLabelHidden`. */
  isOptionalLabelHidden?: boolean
  label: string
  onBeforeInput?: (event: React.FormEvent<T>) => void
  onBlur?: (event: React.FocusEvent<T>) => void
  onChange?: (event: React.ChangeEvent<T>, isDirty: boolean) => void
  onDrop?: (event: React.DragEvent<T>) => void
  onKeyDown?: (event: React.KeyboardEvent<T>) => void
  onPaste?: (event: React.ClipboardEvent<T>) => void
  ref?: (el: T | null) => void
  validationText?: string
  value?: string | number
}

export function Input(
  props: InputProps<HTMLInputElement> & { as?: 'input' }
): JSX.Element
export function Input(
  props: InputProps<HTMLTextAreaElement> & { as: 'textarea' }
): JSX.Element
export function Input<T extends InputElement = HTMLInputElement>({
  as = 'input',
  attributes,
  className,
  defaultValue,
  description,
  errors,
  isLabelHidden,
  isOptionalLabelHidden,
  label,
  onBeforeInput,
  onBlur: onBlurProp,
  onChange,
  onDrop,
  onKeyDown,
  onPaste,
  ref,
  value,
  validationText
}: InputProps<T> & { as?: 'input' | 'textarea' }) {
  // user has changed value
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const onBlur = (event: React.FocusEvent<T>) => {
    if (event.target.value !== defaultValue && !isDirty) {
      setIsDirty(true)
    }
    onBlurProp?.(event)
  }

  const onChangeHandler = (event: React.ChangeEvent<T>) => {
    const changed = event.target.value !== defaultValue
    onChange?.(event, changed)
  }

  const autoId = useId()
  const id = attributes?.id || autoId
  const descriptionId = useId()
  const validationId = useId()
  const errorId = useId()
  const isHidden =
    (attributes as React.InputHTMLAttributes<HTMLInputElement>)
      ?.type === 'hidden' ||
    !!(attributes as React.InputHTMLAttributes<HTMLInputElement>)
      ?.hidden
  const isRequired = !!(
    attributes as React.InputHTMLAttributes<HTMLInputElement>
  )?.required

  const describedby =
    [
      description && descriptionId,
      validationText && validationId,
      errors?.length && errorId
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const inputClassName = clsx(
    className,
    styles.input,
    isDirty && 'dirty',
    errors?.length && 'error'
  )

  const elementProps = {
    ...attributes,
    className: inputClassName,
    defaultValue,
    onBeforeInput,
    onBlur,
    onChange: onChangeHandler,
    onDrop,
    onKeyDown,
    onPaste,
    ref,
    value
  } as Omit<InputProps<T>, 'label'> & {
    onBlur: (event: React.FocusEvent<T>) => void
  }
  const inputType =
    (attributes as React.InputHTMLAttributes<HTMLInputElement>)
      ?.type ?? 'text'

  return (
    <div className={className} hidden={isHidden}>
      {!isHidden && (
        <InputLabel
          isHidden={isHidden}
          htmlFor={id}
          isVisuallyHidden={isLabelHidden}
          isRequired={isRequired}
          isOptionalLabelHidden={isOptionalLabelHidden}
          label={label}
          description={description}
          descriptionId={descriptionId}
        />
      )}
      {as === 'textarea' ? (
        <textarea
          {...(elementProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          id={id}
          aria-describedby={describedby}
        />
      ) : (
        <input
          {...(elementProps as React.InputHTMLAttributes<HTMLInputElement>)}
          id={id}
          aria-describedby={describedby}
          type={inputType}
        />
      )}
      {validationText && (
        <p
          id={validationId}
          className={clsx(
            styles['validation-text'],
            errors?.length && 'visually-hidden'
          )}
        >
          {validationText}
        </p>
      )}
      {errors?.length && (
        <p
          id={errorId}
          role='alert'
          className={styles['error-message']}
        >
          {errors.join(', ')}.
        </p>
      )}
    </div>
  )
}
