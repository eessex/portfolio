'use client'

import { editSiteSettings } from '@/lib/actions'
import type { SiteSettingsClient } from '@/lib/definitions'
import { Form } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function EditSettings ({ settings }: { settings: SiteSettingsClient }) {
  const [coverImageId, setCoverImageId] = useState<string | undefined>(settings?.coverImage?.id)

  return (
    <Form action={(formData: FormData) => editSiteSettings(formData, settings.id)}>
      <Input
        label='Site title'
        description='Shown in menubar and as meta title for search engines.'
        defaultValue={settings?.title}
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
        isTextarea
        attributes={{
          name: 'description',
          maxLength: 300
        }}
      />

      <div>
        <h2>Cover Image</h2>

        <Input
          label='Cover image'
          description='Shown on homepage and as meta image for search engines.'
          value={coverImageId}
          onChange={() => setCoverImageId(undefined)}
          attributes={{
            name: 'coverImageId',
            type: 'hidden',
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

      <Input
        label='Id'
        value={settings.id}
        attributes={{
          name: 'id',
          type: 'hidden',
          readOnly: true
        }}
      />
    </Form>
  )
}
