'use client'

import { editSiteSettings } from '@/lib/actions'
import { SiteSettingsClient } from '@/lib/definitions'
import styles from '@/ui/form/form.module.scss'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useActionState, useState } from 'react'
import { Toast } from './toast/toast'

export default function EditSettingsForm ({ settings }: { settings: SiteSettingsClient }) {
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [coverImageId, setCoverImageId] = useState<string | undefined>(settings?.coverImage?.id)

  const defaultValues = {
    title: settings?.title,
    description: settings?.description,
    coverImageId: settings?.coverImage?.id
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_state, formAction, isPending] = useActionState(
    onSubmit,
    null
  )

  async function onSubmit (_state: void | null, formData: FormData) {
    setError(false)

    const isDirty = Object.keys(defaultValues).some((key) => {
      const defaultValue = defaultValues[key as keyof typeof defaultValues]
      return defaultValue !== formData.get(key)
    })

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
      <div>
        <label>Site title</label>
        <p>Shown in menubar and as meta title for search engines.</p>
        <input type='text' name='title' defaultValue={settings?.title} required maxLength={100} minLength={3} />
      </div>

      <div>
        <label>Site description</label>
        <p>Shown on homepage and as meta description for search engines.</p>
        <textarea name='description' rows={4} defaultValue={settings?.description} maxLength={300} />
      </div>

      <fieldset>
        <legend>Cover image</legend>
        <div>
          <label className='visually-hidden'>Cover image</label>
          <p>Shown on homepage and as meta image for search engines.</p>
          <input type='hidden' name='coverImageId' defaultValue={coverImageId} readOnly />

          {coverImageId && (
            <figure style={{ aspectRatio: settings?.coverImage?.aspect }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings?.coverImage?.url} alt={settings?.coverImage?.caption} title={settings?.coverImage?.caption} />
              <button type='button' onClick={() => setCoverImageId(undefined)} className='button' aria-label='Remove image'>
                <XMarkIcon />
              </button>
            </figure>
          )}
        </div>
      </fieldset>

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
