'use client'

import { editSiteSettings } from '@/lib/site-settings/actions'
import type { SiteSettingsClient } from '@/lib/site-settings/types'
import { AttachEmbeddedItem } from '@/ui/attach-embedded-item/attach-embedded-item'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { formatImageResult } from '@/ui/images/format-image-result'

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

      <AttachEmbeddedItem
        name='coverImageId'
        itemType='images'
        searchParams={pressSearchParams}
        hideCreateNew
        existingItem={settings?.coverImage}
        getCoverImage={(image) => image}
        formatResult={formatImageResult}
        renderEditItemForm={() => null}
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
