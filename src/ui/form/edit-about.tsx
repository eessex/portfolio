'use client'

import { editAbout } from '@/lib/about/actions'
import type { About } from '@/lib/about/types'
import type { Image } from '@/lib/images/schemas/db'
import { Form } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

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
      <Input
        as='textarea'
        label='Description'
        defaultValue={about?.description}
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

      <Input
        label='Cover image id'
        defaultValue={about?.coverImageId}
        attributes={{
          name: 'coverImageId',
          type: 'hidden',
          readOnly: true
        }}
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
    </Form>
  )
}
