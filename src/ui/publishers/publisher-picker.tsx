import {
  createPublisherSchema,
  type Publisher
} from '@/lib/publishers/schemas/db'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { EditPublisher } from '@/ui/publishers/edit-publisher-form'
import { formatPublisherResult } from '@/ui/publishers/format-publisher-result'

/**
 * Picks one publisher: search, or create one from the query alone
 * (edited inline as name + website, or name alone with
 * `isUrlHidden`). The built-in publisher is read-only, so its chip
 * offers no Edit.
 */
export function PublisherPicker({
  autoCreateName,
  description,
  isRequired,
  isUrlHidden,
  label,
  onSelectionChange,
  publisher
}: {
  /**
   * While empty, starts on a new publisher with this name, as a chip
   * (see `ItemPicker` `autoCreateQuery`), e.g. a label's own title.
   */
  autoCreateName?: string
  description?: string
  isRequired?: boolean
  /** Edits name only; see `EditPublisher`. */
  isUrlHidden?: boolean
  label?: string
  onSelectionChange?: (publisher?: Publisher) => void
  publisher?: Publisher
}) {
  return (
    <ItemPicker<Publisher>
      itemType='publishers'
      isSearchFirst
      isCreatedFromQuery
      autoCreateQuery={autoCreateName}
      isRequired={isRequired}
      label={label}
      description={description}
      placeholder='Search or create by name'
      isItemEditable={(publisher) => !publisher.isBuiltIn}
      existingItem={publisher}
      onSelectionChange={onSelectionChange}
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
          isUrlHidden={isUrlHidden}
          publisher={existingItem ?? { name: query }}
        />
      )}
    />
  )
}
