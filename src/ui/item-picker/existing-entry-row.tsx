import type { EmbeddedItemType, PagePath } from '@/lib/schemas'
import type { EmbeddedItem, PageItemClient } from '@/lib/types'
import type { ItemPickerProps } from '@/ui/item-picker/item-picker'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import type { ItemPickerEntry } from '@/ui/item-picker/item-picker-entry'
import { SelectedResult } from '@/ui/selected-results/selected-result'

type ExistingEntryRowProps<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
> = Pick<
  ItemPickerProps<TEmbeddedItem, TPage>,
  'renderExistingResult'
> & {
  entry: Extract<
    ItemPickerEntry<TEmbeddedItem, TPage>,
    { kind: 'existing' }
  >
  itemType: EmbeddedItemType | PagePath
  idInputName: string
  dragHandle?: React.ReactNode
  featuredButton?: React.ReactNode
  /** A single picker's label; wraps the row in a `<fieldset>`. */
  legend?: React.ReactNode
  /** Omitted when the picker has no edit form. */
  onEdit?: () => void
  onRemove: () => void
  removeLabel: string
  setEditButtonRef: (el: HTMLButtonElement | null) => void
}

/** A read-only existing item's result, with its Edit control. */
export function ExistingEntryRow<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
>({
  entry,
  itemType,
  idInputName,
  dragHandle,
  featuredButton,
  legend,
  onEdit,
  onRemove,
  removeLabel,
  setEditButtonRef,
  renderExistingResult
}: ExistingEntryRowProps<TEmbeddedItem, TPage>) {
  const Wrapper = legend ? 'fieldset' : 'div'
  const editButton = onEdit && (
    <button
      type='button'
      className='button-sm'
      ref={setEditButtonRef}
      onClick={onEdit}
    >
      Edit
    </button>
  )
  const extraActions =
    editButton || featuredButton ? (
      <>
        {editButton}
        {featuredButton}
      </>
    ) : undefined

  return (
    <Wrapper className={itemPickerStyles['existing-item-wrapper']}>
      {legend}
      <SelectedResult
        itemType={itemType}
        name={idInputName}
        id={entry.item.id}
        dragHandle={dragHandle}
      >
        {renderExistingResult(
          entry.item,
          onRemove,
          removeLabel,
          extraActions
        )}
      </SelectedResult>
    </Wrapper>
  )
}
