'use client'

import { editSiteSettings } from '@/lib/actions'
import { SiteSettingsClient } from '@/lib/definitions'
import styles from '@/ui/form/form.module.scss'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useActionState, useState } from 'react'
import { Toast } from './toast/toast'
import clsx from 'clsx'

function Input ({
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
    className: clsx(styles.input, isDirty && 'dirty'),
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

export default function EditSettingsForm ({ settings }: { settings: SiteSettingsClient }) {
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [coverImageId, setCoverImageId] = useState<string | undefined>(settings?.coverImage?.id)

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
      await editSiteSettings(formData, settings?.id)
      setSuccess(true)
    } catch (error) {
      setError(true)
      console.error(error)
    }
  }

  return (
    <form className={styles.form} action={formAction}>
      <Input
        label='Site title'
        description='Shown in menubar and as meta title for search engines.'
        defaultValue={settings?.title}
        onChange={onChange}
        attributes={{
          name: 'title',
          required: true,
          maxLength: 100,
          minLength: 3
        }}
      />

      <Input
        label='Site description'
        description='Shown on homepage and as meta description for search engines.'
        defaultValue={settings?.description}
        onChange={onChange}
        attributes={{
          name: 'description',
          type: 'textarea',
          maxLength: 300,
          rows: 4,
        } as React.InputHTMLAttributes<HTMLTextAreaElement>}
      />
      <div>
        <Input
          label='Cover image'
          description='Shown on homepage and as meta image for search engines.'
          value={settings?.coverImageId}
          onChange={() => setCoverImageId(undefined)}
          attributes={{
            type: 'hidden',
            name: 'coverImageId',
            value: coverImageId,
            readOnly: true
          }}
        />

        {coverImageId && (
          <figure style={{ aspectRatio: settings?.coverImage?.aspect }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings?.coverImage?.url} alt={settings?.coverImage?.caption} title={settings?.coverImage?.caption} />
            <button type='button' onClick={() => setCoverImageId(undefined)} className='button' aria-label='Remove cover image'>
              <XMarkIcon />
            </button>
          </figure>
        )}
      </div>

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
