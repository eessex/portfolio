import clsx from 'clsx'

import type { EmbeddedItem, PageItemClient } from '@/lib/types'
import type { ItemPickerProps } from '@/ui/item-picker/item-picker'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import type { Draft } from '@/ui/item-picker/item-picker-entry'
import { NamePrefixProvider } from '@/ui/item-picker/name-prefix'
import type { FieldErrors } from '@/ui/item-picker/use-entry-validation'

type DraftFieldsetProps<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
> = Pick<
  ItemPickerProps<TEmbeddedItem, TPage>,
  'renderEditItemForm'
> & {
  entry: Draft<TEmbeddedItem, TPage>
  /** Name of the hidden id input an `editing` entry submits. */
  idInputName: string
  fieldPrefix: string
  errors?: FieldErrors
  isBusy?: boolean
  isRequired: boolean
  isSearchFirst: boolean
  legend: string
  saveLabel: string
  onSave: () => void
  /** Only for an `editing` entry, which alone can revert. */
  onCancelEdit?: () => void
  onTouched: () => void
  /** Validates when focus leaves the fieldset; omitted for multi. */
  onBlurValidate?: () => void
  onReadyChange?: (isReady: boolean) => void
  onBusyChange: (isBusy: boolean) => void
  setFieldsetRef: (el: HTMLFieldSetElement | null) => void
}

/**
 * A draft's edit fieldset — kept mounted (never unmounted or
 * disabled) even once saved, only visually hidden — a picked
 * `<input type=file>` can't be programmatically repopulated, so its
 * live DOM node must survive a save→edit round-trip; `hidden` still
 * submits the fieldset's inputs on final form submit. The body is just
 * the create form: no visible legend (the combobox header carries the
 * label), and Cancel only for an edit of an existing item (a new draft
 * leaves via the "Search {item}" toggle).
 */
export function DraftFieldset<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
>({
  entry,
  idInputName,
  fieldPrefix,
  errors,
  isBusy,
  isRequired,
  isSearchFirst,
  legend,
  saveLabel,
  onSave,
  onCancelEdit,
  onTouched,
  onBlurValidate,
  onReadyChange,
  onBusyChange,
  setFieldsetRef,
  renderEditItemForm
}: DraftFieldsetProps<TEmbeddedItem, TPage>) {
  return (
    <fieldset
      hidden={entry.isSaved}
      className={itemPickerStyles['new-item-fieldset']}
      ref={setFieldsetRef}
      onChange={entry.isTouched ? undefined : onTouched}
      onBlur={
        onBlurValidate
          ? (e) => {
              if (
                e.relatedTarget instanceof Node &&
                e.currentTarget.contains(e.relatedTarget)
              ) {
                return
              }
              onBlurValidate()
            }
          : undefined
      }
    >
      <legend className='visually-hidden'>{legend}</legend>
      {/* An edited existing item submits its id alongside the edited
          fields, so the server UPDATEs it (an `edited` entry) rather
          than creating a duplicate. */}
      {entry.kind === 'editing' && (
        <input
          type='hidden'
          name={idInputName}
          value={entry.item.id}
          readOnly
        />
      )}
      <NamePrefixProvider prefix={fieldPrefix}>
        {renderEditItemForm?.({
          query: entry.kind === 'new' ? entry.query : undefined,
          errors,
          isRequired,
          onReadyChange,
          existingItem:
            entry.kind === 'editing' ? entry.item : undefined,
          onBusyChange
        })}
      </NamePrefixProvider>
      <div
        className={clsx(
          itemPickerStyles['create-form-actions'],
          isSearchFirst &&
            itemPickerStyles['create-form-actions-visible']
        )}
      >
        <button
          type='button'
          className={`button-primary ${itemPickerStyles['save-button']}`}
          disabled={isBusy}
          onClick={onSave}
        >
          {saveLabel}
        </button>
        {onCancelEdit && (
          <button
            type='button'
            className='button-sm'
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        )}
      </div>
    </fieldset>
  )
}
