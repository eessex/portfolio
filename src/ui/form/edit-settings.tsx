'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import NextImage from 'next/image'
import { useState } from 'react'

import { editSiteSettings } from '@/lib/site-settings/actions'
import type { SiteSettingsClient } from '@/lib/site-settings/types'
import { Form } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

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

        {coverImageId && settings?.coverImage && (
          <figure style={{ aspectRatio: settings?.coverImage?.aspect }}>
            <NextImage
              src={settings?.coverImage?.url}
              alt={settings?.coverImage?.alt || settings?.coverImage?.caption || ''}
              title={settings?.coverImage?.caption || settings?.coverImage?.alt || undefined}
              width={500 * settings?.coverImage?.aspect}
              height={500}
            />
            <button
              type='button'
              onClick={() => setCoverImageId(undefined)}
              className='button'
              aria-label='Remove cover image'
            >
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

      <Input
        label='Created At'
        value={settings.createdAt.toISOString()}
        attributes={{
          name: 'createdAt',
          type: 'hidden',
          readOnly: true
        }}
      />
    </Form>
  )
}
