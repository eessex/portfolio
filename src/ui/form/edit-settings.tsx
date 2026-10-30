'use client'

import { useRouter } from 'next/navigation'

import {
  type Image,
  imageClientFieldsSchema
} from '@/lib/images/schemas/db'
import { editSiteSettings } from '@/lib/site-settings/actions'
import type { SiteSettingsClient } from '@/lib/site-settings/types'
import { Checkbox } from '@/ui/form/checkbox'
import { FieldErrorList } from '@/ui/form/field-error-list'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { EditImage } from '@/ui/images/edit-image-form'
import {
  formatImageResult,
  formatNewImageSummary,
  formatNewSiteIconSummary,
  formatSiteIconResult
} from '@/ui/images/format-image-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { SocialLinksPicker } from '@/ui/links/links-picker'

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
        renderExistingResult={formatImageResult}
        renderNewItemSummary={formatNewImageSummary}
        schema={imageClientFieldsSchema}
        renderEditItemForm={({
          errors,
          isRequired,
          existingItem,
          onReadyChange
        }) => (
          <EditImage
            image={existingItem}
            errors={errors}
            isRequired={isRequired}
            onReadyChange={onReadyChange}
          />
        )}
        isRequired
      />

      <ItemPicker<Image>
        name='iconImageId'
        itemType='images'
        label='Site icon'
        description='A square image, at least 600 × 600. PNG with a transparent background works best.'
        existingItem={settings?.iconImage}
        renderExistingResult={formatSiteIconResult}
        renderNewItemSummary={formatNewSiteIconSummary}
        schema={imageClientFieldsSchema}
        renderEditItemForm={({
          errors,
          isRequired,
          existingItem,
          onReadyChange
        }) => (
          <EditImage
            image={existingItem}
            errors={errors}
            isRequired={isRequired}
            onReadyChange={onReadyChange}
          />
        )}
      />

      <div>
        <SocialLinksPicker links={settings?.socialLinks} />
        <FieldErrorList errors={errors?.socialLinks} />
      </div>

      <Checkbox
        attributes={{ name: 'isEmailSubscribeEnabled' }}
        // on by default, matching the column default
        isDefaultChecked={settings?.isEmailSubscribeEnabled ?? true}
        label='Show email subscribe form'
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
    if (res?.ok) router.refresh()
    return res
  }

  return (
    // remounted per save, so pickers drop their submitted drafts for
    // the saved items and the form's clean baseline matches them
    <Form key={settings?.updatedAt?.getTime()} action={handleSubmit}>
      <SettingsFormFields settings={settings} />
    </Form>
  )
}
