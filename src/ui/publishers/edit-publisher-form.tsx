import type { z } from 'zod'

import type {
  createPublisherSchema,
  Publisher
} from '@/lib/publishers/schemas/db'
import { publisherTypes } from '@/lib/publishers/schemas/db'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'

const publisherTypeOptions = [...publisherTypes]

interface EditPublisherProps {
  errors?: z.inferFlattenedErrors<
    typeof createPublisherSchema
  >['fieldErrors']
  publisher?: Partial<Publisher>
  /** Inline on a published edition: name and website only. */
  isTypeHidden?: boolean
  /**
   * Leaves out the website (a label's own publisher, set up from
   * the project form). A saved website is kept, not cleared.
   */
  isUrlHidden?: boolean
}

export const EditPublisher = ({
  errors,
  publisher,
  isTypeHidden,
  isUrlHidden
}: EditPublisherProps) => {
  const namePrefix = useNamePrefix()

  return (
    <>
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: `${namePrefix}name`,
          placeholder: 'Soap Library',
          required: true,
          autoComplete: 'off'
        }}
        defaultValue={publisher?.name}
        errors={errors?.name}
        label='Name'
      />

      {!isTypeHidden && (
        <Select
          attributes={{
            name: `${namePrefix}type`
          }}
          errors={errors?.type}
          label='Type'
          options={publisherTypeOptions}
          placeholder='Select publisher type'
          value={publisher?.type}
        />
      )}

      {!isUrlHidden && (
        <Input
          attributes={{
            maxLength: MAX_STRING_LENGTH_SHORT,
            name: `${namePrefix}url`,
            placeholder: 'https://example.com',
            type: 'url'
          }}
          defaultValue={publisher?.url}
          description='The homepage or profile of the publisher.'
          errors={errors?.url}
          label='Publisher website'
        />
      )}
    </>
  )
}
