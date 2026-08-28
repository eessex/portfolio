'use client'

import { editAbout } from '@/lib/about/actions'
import type { AboutClient } from '@/lib/about/types'
import type { Image } from '@/lib/images/schemas/db'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { EditImage } from '@/ui/images/edit-image-form'
import { formatImageResult } from '@/ui/images/format-image-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'

function AboutFormFields({ about }: { about?: AboutClient }) {
  const errors = useFormErrors()

  return (
    <>
      <Input
        as='textarea'
        label='Description'
        defaultValue={about?.description}
        errors={errors?.description}
        attributes={{
          name: 'description',
          maxLength: 15000
        }}
      />

      <ItemPicker<Image>
        name='coverImageId'
        label='Cover image'
        itemType='images'
        existingItem={about?.coverImage}
        formatResult={formatImageResult}
        renderEditItemForm={() => (
          <EditImage namePrefix='coverImage' />
        )}
      />
    </>
  )
}

export function EditAboutForm({ about }: { about?: AboutClient }) {
  return (
    <Form
      action={(formData: FormData) => editAbout(formData, about?.id)}
      submitButtonClassName='button-primary button-lg'
    >
      <AboutFormFields about={about} />
    </Form>
  )
}
