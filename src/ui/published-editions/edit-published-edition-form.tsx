import type { z } from 'zod'

import type { Image } from '@/lib/images/schemas/db'
import type { Link } from '@/lib/links/schemas/db'
import type { DashboardPublishedEdition } from '@/lib/published-editions/schemas/client'
import type { createPublishedEditionSchema } from '@/lib/published-editions/schemas/db'
import { publishedEditionTypes } from '@/lib/published-editions/schemas/db'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { AttachEmbeddedItem } from '@/ui/attach-embedded-item/attach-embedded-item'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { PageItemPicker } from '@/ui/page-item-picker/page-item-picker'

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
      <Input
        attributes={{
          maxLength: 255,
          name: 'publisherName',
          placeholder: 'Soap Library',
          required: true
        }}
        defaultValue={publishedEdition?.publisherName}
        errors={errors?.publisherName}
        label='Publisher'
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

      <PageItemPicker<ReleaseClient, FetchReleasesResult>
        pagePath='releases'
        initialItem={
          publishedEdition?.release?.id &&
          publishedEdition?.release?.title
            ? {
                id: publishedEdition.release.id,
                title: publishedEdition.release.title
              }
            : undefined
        }
      />

      <AttachEmbeddedItem<Image>
        name='coverImageId'
        itemType='images'
        hideCreateNew
        existingItem={publishedEdition?.coverImage}
        formatResult={(image) =>
          image.title || image.caption || image.url
        }
        renderEditItemForm={() => null}
      />

      <AttachEmbeddedItem<Link>
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
