'use client'

import { About, Image } from '@/lib/definitions'
import { Input } from '@/ui/form/input'
import { Form } from '@/ui/form/form'
import { editAbout } from '@/lib/actions'

export function EditAboutForm ({ about }: { about: Omit<About, 'slug'> & { coverImage?: Omit<Image, 'id'> } }) {
  return (
    <Form action={(formData: FormData) => editAbout(formData, about.id)}>
      <Input
        label='Description'
        defaultValue={about?.description}
        isTextarea
        attributes={{
          name: 'description',
          maxLength: 15000,
          rows: 10
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
        label='Cover image'
        defaultValue={about?.coverImageId}
        attributes={{
          name: 'coverImageId',
          type: 'hidden',
        }}
      />
    </Form>
  )
}
