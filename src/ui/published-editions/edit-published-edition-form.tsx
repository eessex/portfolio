import { useState } from 'react'
import type { z } from 'zod'

import type { PublishedEditionClient } from '@/lib/published-editions/schemas/client'
import {
  type publishedEditionDraftSchema,
  publishedEditionTypes
} from '@/lib/published-editions/schemas/db'
import type { Publisher } from '@/lib/publishers/schemas/db'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import { FieldErrorList } from '@/ui/form/field-error-list'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { toDateInputValue } from '@/ui/format/dates'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'
import { PUBLISHER_NAME_SUMMARY_FIELD } from '@/ui/published-editions/format-published-edition-result'
import { PublisherPicker } from '@/ui/publishers/publisher-picker'

interface EditPublishedEditionProps {
  errors?: z.inferFlattenedErrors<
    typeof publishedEditionDraftSchema
  >['fieldErrors']
  publishedEdition?: Partial<PublishedEditionClient>
  /** a new edition's publisher (a label site's house publisher) */
  defaultPublisher?: Publisher
}

/**
 * One of a release's editions, edited inline in the release form's
 * editions picker (its fields are namespaced by the picker).
 */
export const EditPublishedEdition = ({
  errors,
  publishedEdition,
  defaultPublisher
}: EditPublishedEditionProps) => {
  const namePrefix = useNamePrefix()
  const initialPublisher = publishedEdition
    ? publishedEdition.publisher
    : defaultPublisher
  const [publisherName, setPublisherName] = useState(
    initialPublisher?.name
  )

  return (
    <>
      <div className={styles['input-group']}>
        <Select
          options={[...publishedEditionTypes]}
          errors={errors?.format}
          formatOptionLabel={(option) => option}
          label='Format'
          placeholder='Select a format'
          value={publishedEdition?.format}
          attributes={{ name: `${namePrefix}format`, required: true }}
        />

        <Input
          attributes={{
            name: `${namePrefix}publishDate`,
            required: true,
            type: 'date'
          }}
          defaultValue={toDateInputValue(
            publishedEdition?.publishDate
          )}
          errors={errors?.publishDate}
          label='Publish date'
        />
      </div>

      <div>
        <PublisherPicker
          isRequired
          publisher={initialPublisher}
          onSelectionChange={(publisher) =>
            setPublisherName(publisher?.name)
          }
        />
        {/* for the edition's chip; the server ignores it */}
        <input
          type='hidden'
          name={`${namePrefix}${PUBLISHER_NAME_SUMMARY_FIELD}`}
          value={publisherName ?? ''}
        />
        <FieldErrorList errors={errors?.publisherId} />
      </div>

      <div className={styles['input-group']}>
        <Input
          attributes={{
            min: 1,
            name: `${namePrefix}editionSize`,
            type: 'number',
            placeholder: '500'
          }}
          defaultValue={publishedEdition?.editionSize}
          errors={errors?.editionSize}
          label='Edition size'
        />

        <Input
          attributes={{
            maxLength: MAX_STRING_LENGTH_SHORT,
            name: `${namePrefix}catalogNumber`,
            placeholder: 'SL021'
          }}
          defaultValue={publishedEdition?.catalogNumber}
          errors={errors?.catalogNumber}
          label='Catalog number'
        />
      </div>
    </>
  )
}
