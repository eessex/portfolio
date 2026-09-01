import type { z } from 'zod'

import {
  type Image,
  imageClientFieldsSchema
} from '@/lib/images/schemas/db'
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
import { EditImage } from '@/ui/images/edit-image-form'
import {
  formatImageResult,
  formatNewImageSummary
} from '@/ui/images/format-image-result'
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
  const images = [
    publishedEdition?.coverImage,
    ...(publishedEdition?.images ?? [])
  ].filter((image): image is Image => !!image)

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
        renderEditItemForm={(_query, _index, errors) => (
          <EditPublisher errors={errors} />
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

      <ItemPicker<Image>
        isMulti
        name='images'
        itemType='images'
        label='Images'
        existingItems={images}
        renderExistingResult={formatImageResult}
        renderNewItemSummary={formatNewImageSummary}
        schema={imageClientFieldsSchema}
        renderEditItemForm={(_query, index, errors, isRequired) => (
          <EditImage
            index={index}
            errors={errors}
            isPressFieldsetHidden
            isRequired={isRequired}
          />
        )}
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
