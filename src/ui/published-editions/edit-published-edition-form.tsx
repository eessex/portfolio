import type { z } from 'zod'

import type { Link } from '@/lib/links/schemas/db'
import type { DashboardPublishedEdition } from '@/lib/published-editions/schemas/client'
import type { createPublishedEditionSchema } from '@/lib/published-editions/schemas/db'
import { publishedEditionTypes } from '@/lib/published-editions/schemas/db'
import {
  createPublisherSchema,
  type Publisher
} from '@/lib/publishers/schemas/db'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { ImagesPicker } from '@/ui/images/images-picker'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { formatLinkResult } from '@/ui/links/format-link-result'
import { EditPublisher } from '@/ui/publishers/edit-publisher-form'
import { formatPublisherResult } from '@/ui/publishers/format-publisher-result'
import { formatReleaseResult } from '@/ui/releases/format-release-result'
import { toDateInputValue } from '@/ui/util'

interface EditPublishedEditionProps {
  errors?: z.inferFlattenedErrors<
    typeof createPublishedEditionSchema
  >['fieldErrors']
  publishedEdition?: Partial<DashboardPublishedEdition>
}

export const EditPublishedEdition = ({
  errors,
  publishedEdition
}: EditPublishedEditionProps) => {
  return (
    <>
      <ItemPicker<never, ReleaseClient, FetchReleasesResult>
        itemType='releases'
        isRequired
        existingItem={
          publishedEdition?.release?.id &&
          publishedEdition?.release?.title
            ? (publishedEdition.release as ReleaseClient)
            : undefined
        }
        renderExistingResult={formatReleaseResult}
      />

      <Select
        options={[...publishedEditionTypes]}
        onChange={() => {}}
        formatOptionLabel={(option) => option}
        label='Format'
        placeholder='Select a format'
        value={publishedEdition?.format}
        attributes={{ name: 'format', required: true }}
      />

      <ItemPicker<Publisher>
        itemType='publishers'
        isRequired
        existingItem={publishedEdition?.publisher}
        renderExistingResult={formatPublisherResult}
        schema={createPublisherSchema}
        renderEditItemForm={({ errors, existingItem }) => (
          <EditPublisher errors={errors} publisher={existingItem} />
        )}
      />

      <Input
        attributes={{
          name: 'publishDate',
          placeholder: 'YYYY-MM-DD',
          required: true,
          type: 'date'
        }}
        defaultValue={toDateInputValue(publishedEdition?.publishDate)}
        errors={errors?.publishDate}
        label='Publish date'
      />

      <div className={styles['input-group']}>
        <Input
          attributes={{
            min: 1,
            name: 'editionSize',
            type: 'number',
            placeholder: '1000'
          }}
          defaultValue={publishedEdition?.editionSize}
          errors={errors?.editionSize}
          label='Edition size'
        />

        <Input
          attributes={{
            maxLength: 255,
            name: 'catalogNumber',
            placeholder: 'SL021'
          }}
          defaultValue={publishedEdition?.catalogNumber}
          errors={errors?.catalogNumber}
          label='Catalog number'
        />
      </div>

      <ImagesPicker
        coverImage={publishedEdition?.coverImage}
        images={publishedEdition?.images}
      />

      <ItemPicker<Link>
        name='buyLinkId'
        itemType='links'
        label='Purchase link'
        existingItem={publishedEdition?.buyLink}
        renderExistingResult={formatLinkResult}
      />
    </>
  )
}
