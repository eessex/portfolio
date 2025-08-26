'use client'

import { editAbout } from '@/lib/actions'
import type { About, Image } from '@/lib/definitions'
import { Form } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

export function EditAboutForm ({ about }: { about: About & { coverImage?: Image } }) {
  return (
    <Form action={(formData: FormData) => editAbout(formData, about.id)}>
      <Input
        label='Description'
        defaultValue={about?.description}
        isTextarea
        attributes={{
          name: 'description',
          maxLength: 15000
        }}
      />

      {/* FIXME: rename/add title column */}
      <Input
        label='Byline'
        defaultValue={about?.title}
        attributes={{
          name: 'title',
          maxLength: 255,
        }}
      />

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
    </Form>
  )
}
