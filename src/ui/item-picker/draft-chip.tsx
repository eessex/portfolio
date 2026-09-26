import type { EmbeddedItem, PageItemClient } from '@/lib/types'
import type { ItemPickerProps } from '@/ui/item-picker/item-picker'
import type { Draft } from '@/ui/item-picker/item-picker-entry'
import { ItemResultLabel } from '@/ui/item-result-label'
import selectedResultStyles from '@/ui/selected-results/selected-results.module.scss'

type DraftChipProps<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
> = Pick<
  ItemPickerProps<TEmbeddedItem, TPage>,
  'renderExistingResult' | 'renderNewItemSummary'
> & {
  entry: Draft<TEmbeddedItem, TPage>
  dragHandle?: React.ReactNode
  onEdit: () => void
  onRemove: () => void
  newLabel: string
  removeLabel: string
  setEditButtonRef: (el: HTMLButtonElement | null) => void
}

/** The collapsed chip for a saved draft (new or edited-existing) entry. */
export function DraftChip<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
>({
  entry,
  dragHandle,
  onEdit,
  onRemove,
  renderExistingResult,
  renderNewItemSummary,
  newLabel,
  removeLabel,
  setEditButtonRef
}: DraftChipProps<TEmbeddedItem, TPage>) {
  const editButton = (
    <button
      type='button'
      className='button-sm'
      ref={setEditButtonRef}
      onClick={onEdit}
    >
      Edit
    </button>
  )
  return (
    <div className={selectedResultStyles['selected-result']}>
      {dragHandle}
      <div className={selectedResultStyles['content']}>
        {entry.kind === 'editing' ? (
          // An edited existing item collapses back to its normal result
          // chip (merged with the edits), plus an Edit control to reopen.
          renderExistingResult(
            { ...entry.item, ...entry.summaryData } as
              | TEmbeddedItem
              | TPage,
            onRemove,
            removeLabel,
            editButton
          )
        ) : renderNewItemSummary ? (
          renderNewItemSummary(
            entry.summaryData ?? {},
            entry.previewUrl,
            { editButton, onRemove, removeLabel }
          )
        ) : (
          <ItemResultLabel
            title={newLabel}
            onRemove={onRemove}
            removeLabel={removeLabel}
            extraActions={editButton}
          />
        )}
      </div>
    </div>
  )
}
