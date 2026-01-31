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
  children?: React.ReactNode
  className?: string
  defaultValue?: string | number
  description?: string
  isLabelHidden?: boolean
  label: string
  onChange?: (event: React.ChangeEvent<T>, isDirty: boolean) => void
  ref?: (el: T | null) => void
  value?: string | number
}

export function Input (props: InputProps<HTMLInputElement> & { as?: 'input' }): JSX.Element
export function Input (props: InputProps<HTMLTextAreaElement> & { as: 'textarea' }): JSX.Element
export function Input<T extends InputElement = HTMLInputElement> ({
  as = 'input',
  attributes,
  children,
  className,
  defaultValue,
  description,
  isLabelHidden,
  label,
  onChange,
  ref,
  value
}: InputProps<T> & { as?: 'input' | 'textarea' }) {
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const onBlur = (event: React.FocusEvent<T>) => {
    if (event.target.value !== defaultValue && !isDirty) {
      setIsDirty(true)
    }
  }

  const onChangeHandler = (event: React.ChangeEvent<T>) => {
    if (!isDirty) {
      setIsDirty(event.target.value !== defaultValue)
    }
    onChange?.(event, event.target.value !== defaultValue)
  }

  const autoId = useId()
  const id = attributes?.id || autoId
  const isHidden = (attributes as React.InputHTMLAttributes<HTMLInputElement>)?.type === 'hidden'

  const props = {
    ...attributes,
    className: clsx(className, styles.input, isDirty && 'dirty', isHidden && 'visually-hidden'),
    defaultValue,
    onBlur,
    onChange: onChangeHandler,
    ref,
    value
  } as Omit<InputProps<T>, 'label'> & { onBlur: (event: React.FocusEvent<T>) => void }

  return (
    <div
      className={props.className}
      hidden={attributes?.hidden}
    >
      {!isHidden && (
        <>
          <label
            className={clsx(isLabelHidden && 'visually-hidden')}
            htmlFor={id}
            hidden={attributes?.hidden}
          >
            {label}
          </label>

          {description && (
            <p>
              {description}
            </p>
          )}
        </>
      )}
      {as === 'textarea'
        ? <textarea
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
          id={id}
          />
        : <input
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
          id={id}
          />}
      {children}
    </div>
  )
}
