'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  type Image,
  imageClientFieldsSchema
} from '@/lib/images/schemas/db'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
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
import {
  NavItemsFields,
  type NavItemStatuses
} from '@/ui/nav/nav-items-fields'

function SettingsFormFields({
  settings,
  navStatuses
}: {
  settings?: SiteSettingsClient
  navStatuses?: NavItemStatuses
}) {
  const errors = useFormErrors()
  const [isLogoSet, setIsLogoSet] = useState(!!settings?.logoImage)

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

      <ItemPicker<Image>
        name='logoImageId'
        onItemPresenceChange={setIsLogoSet}
        itemType='images'
        label='Logo'
        description="Shown beside the site title in the menubar. SVG logos render in the theme's text color."
        existingItem={settings?.logoImage}
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
            isSvgAllowed
            onReadyChange={onReadyChange}
          />
        )}
      />

      {/* hidden, not unmounted, so a logo swap keeps the choice */}
      <div hidden={!isLogoSet}>
        <Checkbox
          attributes={{ name: 'isLogoOnly' }}
          isDefaultChecked={settings?.isLogoOnly}
          // the title text stays for screen readers
          label='Show logo only, hiding the menubar site title text when a logo is set'
        />
      </div>

      <Input
        as='textarea'
        label='Site description'
        description='Shown on homepage and as meta description for search engines.'
        defaultValue={settings?.description}
        errors={errors?.description}
        attributes={{
          name: 'description',
          maxLength: MAX_STRING_LENGTH_SHORT,
          required: true
        }}
      />

      <ItemPicker<Image>
        name='coverImageId'
        itemType='images'
        // link previews don't render SVG
        searchParams={{ isSvgExcluded: true }}
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
        label='Site favicon'
        description='A square image: an SVG, or at least 600 × 600. A transparent background works best.'
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
            isSvgAllowed
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

      <NavItemsFields
        navItems={settings?.navItems}
        statuses={navStatuses}
        errors={errors?.navItems}
      />
    </>
  )
}

export function EditSettings({
  settings,
  navStatuses
}: {
  settings?: SiteSettingsClient
  /** the hint beside each menu item; none on first-run setup */
  navStatuses?: NavItemStatuses
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
      <SettingsFormFields
        settings={settings}
        navStatuses={navStatuses}
      />
    </Form>
  )
}
