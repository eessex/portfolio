import { useState } from 'react'
import type { z } from 'zod'

import type { PublishedEditionClient } from '@/lib/published-editions/schemas/client'
import {
  type publishedEditionDraftSchema,
  publishedEditionTypes
} from '@/lib/published-editions/schemas/db'
import {
  createPublisherSchema,
  type Publisher
} from '@/lib/publishers/schemas/db'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'
import { PUBLISHER_NAME_SUMMARY_FIELD } from '@/ui/published-editions/format-published-edition-result'
import { EditPublisher } from '@/ui/publishers/edit-publisher-form'
import { formatPublisherResult } from '@/ui/publishers/format-publisher-result'
import { toDateInputValue } from '@/ui/util'

interface EditPublishedEditionProps {
  errors?: z.inferFlattenedErrors<
    typeof publishedEditionDraftSchema
  >['fieldErrors']
  publishedEdition?: Partial<PublishedEditionClient>
}

/**
 * One of a release's editions, edited inline in the release form's
 * editions picker (its fields are namespaced by the picker).
 */
export const EditPublishedEdition = ({
  errors,
  publishedEdition
}: EditPublishedEditionProps) => {
  const namePrefix = useNamePrefix()
  const [publisherName, setPublisherName] = useState(
    publishedEdition?.publisher?.name
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
        <ItemPicker<Publisher>
          itemType='publishers'
          isSearchFirst
          isCreatedFromQuery
          isRequired
          placeholder='Search or create by name'
          isItemEditable={(publisher) => !publisher.isBuiltIn}
          existingItem={publishedEdition?.publisher}
          onSelectionChange={(publisher) =>
            setPublisherName(publisher?.name)
          }
          renderExistingResult={formatPublisherResult}
          renderNewItemSummary={(data, _previewUrl, actions) =>
            formatPublisherResult(
              { name: String(data.name ?? '') } as Publisher,
              actions.onRemove,
              actions.removeLabel,
              actions.editButton
            )
          }
          schema={createPublisherSchema}
          renderEditItemForm={({ errors, existingItem, query }) => (
            <EditPublisher
              errors={errors}
              isTypeHidden
              publisher={existingItem ?? { name: query }}
            />
          )}
        />
        {/* for the edition's chip; the server ignores it */}
        <input
          type='hidden'
          name={`${namePrefix}${PUBLISHER_NAME_SUMMARY_FIELD}`}
          value={publisherName ?? ''}
        />
        {errors?.publisherId && (
          <p role='alert' className={styles['error-message']}>
            {errors.publisherId.join(', ')}.
          </p>
        )}
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
