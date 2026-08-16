'use client'

import { useRouter } from 'next/navigation'

import type { Image } from '@/lib/images/schemas/db'
import { editSiteSettings } from '@/lib/site-settings/actions'
import type { SiteSettingsClient } from '@/lib/site-settings/types'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { EditImage } from '@/ui/images/edit-image-form'
import { formatImageResult } from '@/ui/images/format-image-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'

function SettingsFormFields({
  settings
}: {
  settings?: SiteSettingsClient
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
          maxLength: 255,
          required: true
        }}
      />

      <ItemPicker<Image>
        name='coverImageId'
        itemType='images'
        label='Cover image'
        description='Shown on homepage and as default meta image for search engines and link unfurling.'
        existingItem={settings?.coverImage}
        formatResult={formatImageResult}
        renderEditItemForm={() => <EditImage />}
        isRequired
      />
    </>
  )
}

export function EditSettings({
  settings
}: {
  settings?: SiteSettingsClient
}) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const res = await editSiteSettings(formData, settings?.id)
    if (res?.ok && !settings) router.refresh()
    return res
  }

  return (
    <Form
      action={handleSubmit}
      submitButtonClassName='button-primary button-lg'
    >
      <SettingsFormFields settings={settings} />
    </Form>
  )
}
