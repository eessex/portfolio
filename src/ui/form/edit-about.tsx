'use client'

import { editAbout } from '@/lib/about/actions'
import type { About } from '@/lib/about/types'
import type { Image } from '@/lib/images/schemas/db'
import { AttachEmbeddedItem } from '@/ui/attach-embedded-item/attach-embedded-item'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

// Only press photos may be attached as the about cover image
const pressSearchParams = { isPress: true }

function AboutFormFields({
  about
}: {
  about: About & { coverImage?: Image }
}) {
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

      {/* FIXME: rename/add title column
      <Input
        label='Byline'
        defaultValue={about?.title}
        attributes={{
          name: 'title',
          maxLength: 255,
        }}
      /> */}

      <AttachEmbeddedItem<Image>
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

      <Input
        label='Id'
        defaultValue={about?.id}
        attributes={{
          name: 'id',
          type: 'hidden',
          readOnly: true
        }}
      />

      <Input
        label='Created At'
        defaultValue={about?.createdAt.toISOString()}
        attributes={{
          name: 'createdAt',
          type: 'hidden',
          readOnly: true
        }}
      />

      <Input
        label='Slug'
        defaultValue={about?.slug}
        attributes={{
          name: 'slug',
          type: 'hidden',
          readOnly: true
        }}
      />
    </>
  )
}

export function EditAboutForm({
  about
}: {
  about: About & { coverImage?: Image }
}) {
  return (
    <Form
      action={(formData: FormData) => editAbout(formData, about.id)}
      submitButtonClassName='button-primary button-lg'
    >
      <AboutFormFields about={about} />
    </Form>
  )
}
