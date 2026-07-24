'use client'

import type { Image } from '@/lib/images/schemas/db'
import { editSiteSettings } from '@/lib/site-settings/actions'
import type { SiteSettingsClient } from '@/lib/site-settings/types'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { formatImageResult } from '@/ui/images/format-image-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'

// Only press photos may be attached as the site cover image
const pressSearchParams = { isPress: true }

function SettingsFormFields({
  settings
}: {
  settings: SiteSettingsClient
}) {
  const errors = useFormErrors()

  return (
    <>
      <Input
        label='Site title'
        description='Shown in menubar and as meta title for search engines.'
        defaultValue={settings?.title}
        errors={errors?.title}
        attributes={{
          name: 'title',
          required: true,
          maxLength: 100,
          minLength: 3
        }}
      />

      <Input
        as='textarea'
        label='Site description'
        description='Shown on homepage and as meta description for search engines.'
        defaultValue={settings?.description}
        errors={errors?.description}
        attributes={{
          name: 'description',
          maxLength: 255
        }}
      />

      <ItemPicker<Image>
        name='coverImageId'
        itemType='images'
        label='Cover image'
        searchParams={pressSearchParams}
        existingItem={settings?.coverImage}
        formatResult={formatImageResult}
      />
    </>
  )
}

export function EditSettings({
  settings
}: {
  settings: SiteSettingsClient
}) {
  return (
    <Form
      action={(formData: FormData) =>
        editSiteSettings(formData, settings.id)
      }
      submitButtonClassName='button-primary button-lg'
    >
      <SettingsFormFields settings={settings} />
    </Form>
  )
}
