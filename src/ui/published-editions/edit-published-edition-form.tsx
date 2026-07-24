import type { z } from 'zod'

import type { Image } from '@/lib/images/schemas/db'
import type { Link } from '@/lib/links/schemas/db'
import type { DashboardPublishedEdition } from '@/lib/published-editions/schemas/client'
import type { createPublishedEditionSchema } from '@/lib/published-editions/schemas/db'
import { publishedEditionTypes } from '@/lib/published-editions/schemas/db'
import type { Publisher } from '@/lib/publishers/schemas/db'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { formattedItemTitle } from '@/ui/util'

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
      <ItemPicker<Publisher>
        itemType='publishers'
        isRequired
        existingItem={publishedEdition?.publisher}
        formatResult={(publisher) => publisher.name}
      />

      <Select
        options={[...publishedEditionTypes]}
        onChange={() => {}}
        label='Format'
        placeholder='Select a format'
        value={publishedEdition?.format}
        attributes={{ name: 'format', required: true }}
      />

      <Input
        attributes={{
          name: 'publishDate',
          placeholder: 'YYYY-MM-DD',
          required: true,
          type: 'date'
        }}
        defaultValue={
          publishedEdition?.publishDate
            ? new Date(publishedEdition.publishDate)
                .toISOString()
                .split('T')[0]
            : ''
        }
        errors={errors?.publishDate}
        label='Publish date'
      />

      <Input
        attributes={{
          min: 1,
          name: 'editionSize',
          type: 'number'
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

      <ItemPicker<never, ReleaseClient, FetchReleasesResult>
        itemType='releases'
        isRequired
        existingItem={
          publishedEdition?.release?.id &&
          publishedEdition?.release?.title
            ? (publishedEdition.release as ReleaseClient)
            : undefined
        }
        formatResult={formattedItemTitle}
      />

      <ItemPicker<Image>
        name='coverImageId'
        itemType='images'
        hideCreateNew
        existingItem={publishedEdition?.coverImage}
        formatResult={(image) =>
          image.title || image.caption || image.url
        }
        renderEditItemForm={() => null}
      />

      <ItemPicker<Link>
        name='buyLinkId'
        itemType='links'
        hideCreateNew
        existingItem={publishedEdition?.buyLink}
        formatResult={(link) => link.title || link.url}
        renderEditItemForm={() => null}
      />
    </>
  )
}
