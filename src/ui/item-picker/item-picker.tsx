'use client'

import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useRef, useState } from 'react'

import {
  type EmbeddedItemType,
  itemTypeToLabel,
  type PagePath
} from '@/lib/schemas'
import type {
  EmbeddedItem,
  PageDataResponse,
  PageItemClient
} from '@/lib/types'
import { Combobox } from '@/ui/combobox/combobox'
import { SortableList } from '@/ui/drag-and-drop/sortable-list'
import styles from '@/ui/form/form.module.scss'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import type { ResultsResponse } from '@/ui/useResultsList'
import type { SearchParams } from '@/ui/util'

type ItemPickerSharedProps<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient,
  S extends PageDataResponse | undefined
> = {
  hideCreateNew?: boolean
  /** Server-seeded first page. Omit to fetch on mount. */
  initialResults?: ResultsResponse<TEmbeddedItem, TPage, S>
  label?: string
  searchParams?: SearchParams
  isRequired?: boolean
  itemType: EmbeddedItemType | PagePath
  /**
   * Form field name for the hidden id input(s). Defaults to
   * `${singular(itemType)}Id`; pass explicitly for specific-purpose
   * relations (e.g. `coverImageId` for an `images` item), or as the
   * array field name when `isMulti` (e.g. `images`, rendering hidden
   * inputs named `images[0].id`, `images[1].id`, ...).
   */
  name?: string
  /**
   * Renders item content for both the `Combobox` dropdown row and
   * `SelectedResult` chip. `extraActions` (e.g. the `featured` toggle)
   * is passed through only for the latter,  rendered next to `onRemove`
   * button when the formatter supports it.
   */
  formatResult: (
    item: TEmbeddedItem | TPage,
    onRemove?: () => void,
    removeLabel?: string,
    extraActions?: React.ReactNode
  ) => React.ReactNode
  /**
   * Renders the inline "create new" form. Omit for item types with no
   * such flow (page items like events/projects/releases are created on
   * their own dedicated pages, not inline). When `isMulti`, the slot's
   * index is passed so fields can be bracketed the same way (e.g.
   * `images[${index}].file`) for the parent form to reconstruct on
   * submit — nothing is saved until the whole form is submitted.
   */
  renderEditItemForm?: (
    query: string | undefined,
    index?: number
  ) => React.ReactNode
  /**
   * Enables an explicit "featured" toggle on an `isMulti` list: any
   * slot can be pinned to the front (excluded from drag reordering)
   * via a button, and un-pinned again, rather than position alone
   * carrying that meaning (contrast `images`, where the first slot is
   * always the cover). Submits a `${name}Featured` hidden flag only
   * while a slot is pinned, so a list with no explicit featured choice
   * round-trips with none — pair with a resolver that checks for that
   * flag (e.g. `resolveOrderedEmbedCodeIds`) rather than assuming
   * position 0.
   */
  featured?: {
    isInitiallyFeatured: boolean
    label?: string
  }
}

export type ItemPickerProps<
  TEmbeddedItem extends EmbeddedItem = never,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
> = ItemPickerSharedProps<TEmbeddedItem, TPage, S> &
  (
    | { isMulti?: false; existingItem?: TEmbeddedItem | TPage }
    | { isMulti: true; existingItems?: (TEmbeddedItem | TPage)[] }
  )

type Slot<TEmbeddedItem, TPage> =
  | { kind: 'existing'; item: TEmbeddedItem | TPage }
  | { kind: 'new'; query?: string; tempId: string }

function slotId(slot: Slot<unknown, unknown>): string {
  return slot.kind === 'existing'
    ? (slot.item as { id: string }).id
    : slot.tempId
}

/**
 * Search for and select an existing item — an embedded item (image,
 * link, venue, etc.) or a page item (event, project, release) — to
 * attach to a form. Embedded items can optionally be created inline via
 * `renderEditItemForm`; page items have their own dedicated create page,
 * so that flow is omitted for them.
 *
 * Pass `isMulti` to allow selecting/creating any number of items instead
 * of just one; hidden inputs are then indexed (`${name}[0].id`, ...), an
 * always-present `${name}[]` marker is rendered so the parent form can
 * tell "no items selected" apart from "this field wasn't submitted at
 * all" (letting a previously-set list be cleared on save), and (once
 * there's more than one item) the list becomes drag/keyboard-reorderable
 * via `SortableList` — reordering is sufficient by itself to change the
 * submitted order, since the bracket indices are derived from array
 * position.
 *
 * `TEmbeddedItem`/`TPage`/`S` must be specified explicitly at the call
 * site, since they can't be inferred from the runtime `itemType` string
 * alone, e.g. `<ItemPicker<never, ReleaseClient, FetchReleasesResult>
 * itemType='releases' .../>` or `<ItemPicker<Venue> itemType='venues' .../>`.
 */
export function ItemPicker<
  TEmbeddedItem extends EmbeddedItem = never,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
>(props: ItemPickerProps<TEmbeddedItem, TPage, S>) {
  const {
    hideCreateNew,
    initialResults,
    searchParams,
    isRequired,
    itemType,
    label,
    name,
    formatResult,
    renderEditItemForm,
    isMulti,
    featured
  } = props

  const [slots, setSlots] = useState<Slot<TEmbeddedItem, TPage>[]>(
    () =>
      isMulti
        ? (props.existingItems ?? []).map((item) => ({
            kind: 'existing' as const,
            item
          }))
        : props.existingItem
          ? [{ kind: 'existing' as const, item: props.existingItem }]
          : []
  )
  const [isFeatured, setIsFeatured] = useState(
    featured?.isInitiallyFeatured ?? false
  )
  const nextTempId = useRef(0)

  const itemLabel = label || itemTypeToLabel(itemType, true)
  const newLabel = `Add New ${itemTypeToLabel(itemType, true, true)}`
  const removeLabel = `Remove ${itemTypeToLabel(itemType, true, true)}`
  const featuredLabel = featured?.label || 'Featured'

  const featuredSlot = featured && isFeatured ? slots[0] : undefined
  const restSlots = featuredSlot ? slots.slice(1) : slots

  function insertSlot(
    current: Slot<TEmbeddedItem, TPage>[],
    slot: Slot<TEmbeddedItem, TPage>
  ) {
    if (!isMulti) return [slot]
    // Keep a pinned featured slot at the front; new picks join the
    // (reorderable) rest right after it instead of displacing it.
    if (featured && isFeatured && current.length > 0) {
      return [current[0], slot, ...current.slice(1)]
    }
    return [slot, ...current]
  }

  function removeSlot(index: number) {
    if (featuredSlot && index === 0) setIsFeatured(false)
    setSlots((current) => current.filter((_, i) => i !== index))
  }

  function addExisting(item: TEmbeddedItem | TPage) {
    setSlots((current) => {
      if (
        current.some(
          (s) => s.kind === 'existing' && s.item.id === item.id
        )
      ) {
        return current
      }
      return insertSlot(current, { kind: 'existing', item })
    })
  }

  function addNew(query?: string) {
    setSlots((current) =>
      insertSlot(current, {
        kind: 'new',
        query,
        tempId: `new-${nextTempId.current++}`
      })
    )
  }

  function setFeatured(index: number) {
    setSlots((current) => {
      const target = current[index]
      if (!target) return current
      return [target, ...current.filter((_, i) => i !== index)]
    })
    setIsFeatured(true)
  }

  function featuredControl(
    index: number,
    isCurrentlyFeatured: boolean
  ) {
    if (!featured) return undefined
    return isCurrentlyFeatured ? (
      <button
        type='button'
        aria-label={`Unset ${featuredLabel}`}
        className={`${itemPickerStyles['featured-button']} button-icon`}
        onClick={() => setIsFeatured(false)}
      >
        <StarIconSolid />
      </button>
    ) : (
      <button
        type='button'
        aria-label={`Set as ${featuredLabel}`}
        className={`${itemPickerStyles['featured-button']} button-icon`}
        onClick={() => setFeatured(index)}
      >
        <StarIcon />
      </button>
    )
  }

  function renderSlot(
    slot: Slot<TEmbeddedItem, TPage>,
    index: number,
    dragHandle?: React.ReactNode,
    featuredButton?: React.ReactNode
  ) {
    return slot.kind === 'existing' ? (
      <div>
        {!isMulti && <h2>{itemLabel}</h2>}
        <SelectedResult
          itemType={itemType}
          name={isMulti ? `${name}[${index}].id` : name}
          id={slot.item.id}
          isRequired={isRequired}
          dragHandle={dragHandle}
        >
          {formatResult(
            slot.item,
            () => removeSlot(index),
            removeLabel,
            featuredButton
          )}
        </SelectedResult>
      </div>
    ) : (
      <fieldset>
        <legend>
          {dragHandle}
          {newLabel}
        </legend>
        {renderEditItemForm?.(
          slot.query,
          isMulti ? index : undefined
        )}
        {featuredButton}
        <button
          type='button'
          className={`${styles['cancel']} button-sm`}
          onClick={() => removeSlot(index)}
        >
          Cancel
        </button>
      </fieldset>
    )
  }

  const showCombobox = isMulti || slots.length === 0

  return (
    <>
      {isMulti && name && (
        <input name={`${name}[]`} type='hidden' value='' readOnly />
      )}

      {featuredSlot && name && (
        <input
          name={`${name}Featured`}
          type='hidden'
          value='true'
          readOnly
        />
      )}

      {showCombobox && (
        <Combobox<TEmbeddedItem, TPage, S>
          label={label}
          initialResults={initialResults}
          searchParams={searchParams}
          itemType={itemType}
          formatResult={formatResult}
          onCreateNew={
            renderEditItemForm && !hideCreateNew
              ? (q) => addNew(q || undefined)
              : undefined
          }
          onSelect={addExisting}
        />
      )}

      {featuredSlot && (
        <div>
          {renderSlot(
            featuredSlot,
            0,
            undefined,
            featuredControl(0, true)
          )}
        </div>
      )}

      {isMulti && restSlots.length > 1 ? (
        <SortableList
          className={itemPickerStyles['item-list']}
          items={restSlots.map((slot) => ({
            id: slotId(slot),
            slot
          }))}
          onReorder={(reordered) =>
            setSlots(
              featuredSlot
                ? [
                    featuredSlot,
                    ...reordered.map((entry) => entry.slot)
                  ]
                : reordered.map((entry) => entry.slot)
            )
          }
          renderItem={(entry, index, dragHandle) => {
            const slotIndex = index + (featuredSlot ? 1 : 0)
            return renderSlot(
              entry.slot,
              slotIndex,
              dragHandle,
              featuredControl(slotIndex, false)
            )
          }}
        />
      ) : (
        <div className={itemPickerStyles['item-list']}>
          {restSlots.map((slot, index) => {
            const slotIndex = index + (featuredSlot ? 1 : 0)
            return (
              <div key={slotId(slot)}>
                {renderSlot(
                  slot,
                  slotIndex,
                  undefined,
                  featuredControl(slotIndex, false)
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
