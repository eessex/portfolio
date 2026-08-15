'use client'

import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'
import type { z } from 'zod'

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
import { normalizeFormData } from '@/lib/util'
import { Combobox } from '@/ui/combobox/combobox'
import { SortableList } from '@/ui/drag-and-drop/sortable-list'
import styles from '@/ui/form/form.module.scss'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import type { ResultsResponse } from '@/ui/useResultsList'
import type { SearchParams } from '@/ui/util'

type FieldErrors = Record<string, string[] | undefined>

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
    index?: number,
    errors?: FieldErrors
  ) => React.ReactNode
  /**
   * omit for item types whose schema needs data unavailable client-side
   * (e.g. `images`, where `url` is generated from server-side S3 upload).
   */
  schema?: z.ZodTypeAny
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
    featured,
    schema
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
  const [newSlotErrors, setNewSlotErrors] = useState<
    Record<string, FieldErrors>
  >({})
  // Whether this itemType (under `searchParams`) has zero results to
  // search at all — reported by Combobox once its first fetch
  // resolves. Single-select pickers with an inline create form skip
  // straight to that form instead of showing a search box that could
  // never return anything.
  const [hasNoItemsToSearch, setHasNoItemsToSearch] = useState(false)
  const nextTempId = useRef(0)
  const newSlotFieldsets = useRef(
    new Map<string, HTMLFieldSetElement>()
  )

  const itemLabel = label || itemTypeToLabel(itemType, true)
  const newLabel = `New ${itemTypeToLabel(itemType, true, true)}`
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
    setSlots((current) => {
      const removed = current[index]
      if (removed?.kind === 'new') {
        setNewSlotErrors(({ [removed.tempId]: _, ...rest }) => rest)
      }
      return current.filter((_, i) => i !== index)
    })
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

  useEffect(() => {
    if (
      !isMulti &&
      hasNoItemsToSearch &&
      renderEditItemForm &&
      !hideCreateNew &&
      slots.length === 0
    ) {
      addNew()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNoItemsToSearch])

  function setNewSlotFieldsetRef(
    tempId: string,
    el: HTMLFieldSetElement | null
  ) {
    if (el) newSlotFieldsets.current.set(tempId, el)
    else newSlotFieldsets.current.delete(tempId)
  }

  function isValidatable(
    el: Element
  ): el is
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement {
    return 'willValidate' in el && 'checkValidity' in el
  }

  /**
   * Reads a "new" slot's fieldset back into the flat shape its create
   * schema expects, stripping the `${name}[${index}].` bracket prefix
   * those fields are rendered with (mirrors `extractIndexedGroups`,
   * which strips the same prefix server-side from the real submission).
   */
  function collectSlotData(
    fieldset: HTMLFieldSetElement,
    prefix: string
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    Array.from(fieldset.elements)
      .filter(isValidatable)
      .forEach((el) => {
        if (!el.name.startsWith(prefix)) return
        const field = el.name.slice(prefix.length)
        data[field] =
          el instanceof HTMLInputElement && el.type === 'checkbox'
            ? el.checked
            : el instanceof HTMLInputElement && el.type === 'file'
              ? el.files?.[0]
              : el.value
      })
    return data
  }

  /**
   * Runs `schema` (the same create schema the server validates
   * against, see `createLinkFromFields` etc.) against a "new" slot's
   * current fieldset values, updating `newSlotErrors` with real Zod
   * messages. Always valid (a no-op) for item types (e.g. `images`)
   * whose schema needs data not yet available client-side, since
   * `schema` is omitted for those. `focus` additionally moves focus to
   * the first invalid field — used when blocking progress (adding
   * another slot); omitted for the quieter blur-triggered check below,
   * which shouldn't fight the user's own tab navigation.
   */
  function validateNewSlot(
    index: number,
    slot: Slot<TEmbeddedItem, TPage>,
    options: { focus?: boolean } = {}
  ): boolean {
    if (slot.kind !== 'new' || !schema) return true
    const fieldset = newSlotFieldsets.current.get(slot.tempId)
    if (!fieldset) return true

    const prefix = isMulti ? `${name}[${index}].` : ''
    const parsed = schema.safeParse(
      normalizeFormData(collectSlotData(fieldset, prefix))
    )

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten()
        .fieldErrors as FieldErrors
      setNewSlotErrors((current) => ({
        ...current,
        [slot.tempId]: fieldErrors
      }))
      if (options.focus) {
        const firstField = Object.keys(fieldErrors)[0]
        const invalidEl = firstField
          ? fieldset.elements.namedItem(`${prefix}${firstField}`)
          : null
        if (invalidEl instanceof HTMLElement) invalidEl.focus()
      }
      return false
    }

    if (slot.tempId in newSlotErrors) {
      setNewSlotErrors(({ [slot.tempId]: _, ...rest }) => rest)
    }
    return true
  }

  /**
   * Blocks adding another "new" slot while an existing one is still
   * incomplete or invalid, surfacing why instead of letting bad data
   * reach the server. Native `required`/`type` constraints (already
   * set on each domain's edit-item form, e.g. `EditLink`'s url
   * `required`) run first, since they're the only signal for fields a
   * schema can't see yet (e.g. embed codes' `iframe` textarea, which
   * isn't itself a schema field — only the `host`/`src`/`type` parsed
   * from it are); `validateNewSlot` then re-checks with `schema` for
   * real Zod error messages.
   */
  function focusInvalidNewSlot(): boolean {
    for (const [index, slot] of slots.entries()) {
      if (slot.kind !== 'new') continue
      const fieldset = newSlotFieldsets.current.get(slot.tempId)
      if (!fieldset) continue

      const invalid = Array.from(fieldset.elements)
        .filter(isValidatable)
        .find((el) => el.willValidate && !el.checkValidity())

      if (invalid) {
        invalid.reportValidity()
        return true
      }

      if (!validateNewSlot(index, slot, { focus: true })) return true
    }
    return false
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
        {!isMulti && (
          <h2>
            {itemLabel}
            {!isRequired && (
              <>
                {' '}
                <span className={styles['optional-label']}>
                  optional
                </span>
              </>
            )}
          </h2>
        )}
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
      <fieldset
        ref={(el) => setNewSlotFieldsetRef(slot.tempId, el)}
        // Multi-item slots are already validated when the user tries
        // to add another one (`focusInvalidNewSlot`); single-item
        // pickers never get that second chance (the Combobox that
        // triggers it disappears once a slot exists), so validate
        // quietly on blur instead, once focus actually leaves the
        // fieldset rather than just moving between its own fields.
        onBlur={
          isMulti
            ? undefined
            : (e) => {
                if (
                  e.relatedTarget instanceof Node &&
                  e.currentTarget.contains(e.relatedTarget)
                ) {
                  return
                }
                validateNewSlot(index, slot)
              }
        }
      >
        <legend className={itemPickerStyles['new-item-legend']}>
          {dragHandle}
          {newLabel}
          {featuredButton}
        </legend>
        {renderEditItemForm?.(
          slot.query,
          isMulti ? index : undefined,
          newSlotErrors[slot.tempId]
        )}
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
    <div className={itemPickerStyles['item-picker']}>
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
          isRequired={isRequired}
          initialResults={initialResults}
          searchParams={searchParams}
          itemType={itemType}
          formatResult={formatResult}
          onTotalCountChange={(total) =>
            setHasNoItemsToSearch(total === 0)
          }
          onCreateNew={
            renderEditItemForm && !hideCreateNew
              ? (q) => {
                  if (focusInvalidNewSlot()) return
                  addNew(q || undefined)
                }
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
        restSlots.length > 0 && (
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
        )
      )}
    </div>
  )
}
