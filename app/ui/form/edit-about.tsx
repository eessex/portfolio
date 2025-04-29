'use client'

import { About, Image } from '@/lib/definitions'
import { useActionState, useState } from 'react'
import { Toast } from '@/ui/toast/toast'
import styles from '@/ui/form/form.module.scss'
import clsx from 'clsx'
import { editAbout } from '@/lib/actions'

function Input ({
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

export function EditAboutForm ({ about }: { about: Omit<About, 'slug'> & { coverImage?: Omit<Image, 'id'> } }) {
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [isDirty, setIsDirty] = useState<boolean>(false)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_state, formAction, isPending] = useActionState(
    onSubmit,
    null
  )

  function onChange (_event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, isDirty: boolean) {
    setIsDirty(isDirty)
  }

  async function onSubmit (_state: void | null, formData: FormData) {
    setError(false)
    if (!isDirty) {
      setSuccess(true)
      console.info('No changes made.')
      return
    }

    try {
      await editAbout(formData, about.id)
      setSuccess(true)
    } catch (error) {
      setError(true)
      console.error(error)
    }
  }

  return (
    <form className={styles.form} action={formAction}>
      <Input
        label='Description'
        defaultValue={about?.description}
        onChange={onChange}
        isTextarea
        attributes={{
          name: 'description',
          maxLength: 15000,
          rows: 10
        }}
      />

      {/* FIXME: rename/add title column */}
      <Input
        label='Byline'
        defaultValue={about?.title}
        onChange={onChange}
        attributes={{
          name: 'title',
          maxLength: 255,
        }}
      />

      <Input
        label='Cover image'
        defaultValue={about?.coverImageId}
        onChange={onChange}
        attributes={{
          name: 'coverImageId',
          type: 'hidden',
        }}
      />

      <button className='button' type='submit' disabled={isPending}>
        {isPending ? 'Loading...' : 'Save'}
      </button>

      {error && !isPending && (
        <Toast type='error' onHide={() => setError(false)} />
      )}

      {success && !isPending && (
        <Toast type='success' onHide={() => setSuccess(false)}>
          Changes saved.
        </Toast>
      )}
    </form>
  )
}
