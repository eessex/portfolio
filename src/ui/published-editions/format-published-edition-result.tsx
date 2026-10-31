import type { PublishedEditionClient } from '@/lib/published-editions/schemas/client'
import { formattedDateTime } from '@/ui/format/dates'
import type { NewItemSummaryActions } from '@/ui/item-picker/item-picker'
import { ItemResultLabel } from '@/ui/item-result-label'

/** The edition form's selected publisher's name, for its chip. */
export const PUBLISHER_NAME_SUMMARY_FIELD = 'publisherName'

/**
 * A saved draft's publisher name: renamed or created inline
 * (`publisher.name`), else the selected one's.
 */
function draftPublisherName(data: Record<string, unknown>) {
  const name =
    data['publisher.name'] ?? data[PUBLISHER_NAME_SUMMARY_FIELD]
  return typeof name === 'string' ? name : undefined
}

/** "LP · Soap Library · Jan 2020" */
function editionTitle(
  format?: string,
  publisherName?: string,
  publishDate?: unknown
) {
  const date =
    typeof publishDate === 'string' || publishDate instanceof Date
      ? formattedDateTime(publishDate, 'xs')
      : undefined
  return [format, publisherName, date].filter(Boolean).join(' · ')
}

export function formatPublishedEditionResult(
  edition: PublishedEditionClient,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  return (
    <ItemResultLabel
      title={editionTitle(
        edition.format,
        // an edited edition's chip merges in its draft's flat fields
        draftPublisherName({ ...edition }) ?? edition.publisher?.name,
        edition.publishDate
      )}
      onRemove={onRemove}
      removeLabel={removeLabel}
      extraActions={extraActions}
    />
  )
}

/** A draft edition's chip. */
export function formatNewPublishedEditionSummary(
  data: Record<string, unknown>,
  _previewUrl: string | undefined,
  { editButton, onRemove, removeLabel }: NewItemSummaryActions
) {
  return (
    <ItemResultLabel
      title={editionTitle(
        typeof data.format === 'string' ? data.format : undefined,
        draftPublisherName(data),
        data.publishDate
      )}
      onRemove={onRemove}
      removeLabel={removeLabel}
      extraActions={editButton}
    />
  )
}
