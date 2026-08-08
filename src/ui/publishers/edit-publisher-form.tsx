import type { z } from 'zod'

import type {
  createPublisherSchema,
  Publisher
} from '@/lib/publishers/schemas/db'
import { publisherTypes } from '@/lib/publishers/schemas/db'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'

const publisherTypeOptions = [...publisherTypes]

interface EditPublisherProps {
  errors?: z.inferFlattenedErrors<
    typeof createPublisherSchema
  >['fieldErrors']
  publisher?: Partial<Publisher>
}

export const EditPublisher = ({
  errors,
  publisher
}: EditPublisherProps) => {
  return (
    <>
      <Input
        attributes={{
          maxLength: 255,
          name: 'name',
          placeholder: 'Soap Library',
          required: true
        }}
        defaultValue={publisher?.name}
        errors={errors?.name}
        label='Name'
      />

      <Select
        attributes={{ name: 'type', required: true }}
        label='Type'
        onChange={() => {}}
        options={publisherTypeOptions}
        placeholder='Select publisher type'
        value={publisher?.type}
      />

      <Input
        attributes={{
          maxLength: 255,
          name: 'url',
          placeholder: 'https://example.com',
          type: 'url'
        }}
        defaultValue={publisher?.url}
        description='The homepage or profile of the publisher.'
        errors={errors?.url}
        label='Publisher website'
      />
    </>
  )
}
