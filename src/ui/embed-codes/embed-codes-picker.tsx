import {
  createEmbedCodeSchema,
  type EmbedCode
} from '@/lib/embed-codes/schemas/db'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import {
  formatEmbedCodeResult,
  formatNewEmbedCodeSummary
} from '@/ui/embed-codes/format-embed-code-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'

/** Reorderable embed codes picker. */
export function EmbedCodesPicker({
  embedCodes
}: {
  embedCodes?: EmbedCode[]
}) {
  return (
    <ItemPicker<EmbedCode>
      isMulti
      itemType='embedCodes'
      existingItems={embedCodes ?? []}
      renderExistingResult={formatEmbedCodeResult}
      renderNewItemSummary={formatNewEmbedCodeSummary}
      schema={createEmbedCodeSchema}
      renderEditItemForm={({
        errors,
        isRequired,
        existingItem,
        onBusyChange
      }) => (
        <EditEmbedCode
          embedCode={existingItem}
          errors={errors}
          isRequired={isRequired}
          onBusyChange={onBusyChange}
        />
      )}
    />
  )
}
