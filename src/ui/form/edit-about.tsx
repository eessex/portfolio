'use client'

import { editAbout } from '@/lib/about/actions'
import type { AboutClient } from '@/lib/about/types'
import type { Image } from '@/lib/images/schemas/db'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { ItemPicker } from '@/ui/item-picker/item-picker'

// Only press photos may be attached as the about cover image
const pressSearchParams = { isPress: true }

function AboutFormFields({ about }: { about: AboutClient }) {
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
        itemType='images'
        searchParams={pressSearchParams}
        hideCreateNew
        existingItem={about?.coverImage}
        formatResult={(image) =>
          image.title || image.caption || image.url
        }
        renderEditItemForm={() => null}
      />
    </>
  )
}

export function EditAboutForm({ about }: { about: AboutClient }) {
  return (
    <Form
      action={(formData: FormData) => editAbout(formData, about.id)}
      submitButtonClassName='button-primary button-lg'
    >
      <AboutFormFields about={about} />
    </Form>
  )
}
