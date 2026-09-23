'use client'

import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'
import type { z } from 'zod'

import {
  emptyListFieldName,
  featuredFlagFieldName,
  indexedItemFieldPrefix,
  itemFieldPrefix,
  itemIdFieldName
} from '@/lib/item-fields'
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
import { InputLabel } from '@/ui/form/input-label'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import { NamePrefixProvider } from '@/ui/item-picker/name-prefix'
import { ItemResultLabel } from '@/ui/item-result-label'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import selectedResultStyles from '@/ui/selected-results/selected-results.module.scss'
import type { ResultsResponse } from '@/ui/useResultsList'
import type { SearchParams } from '@/ui/util'

type FieldErrors = Record<string, string[] | undefined>

/** Named args passed to a picker's `renderEditItemForm` callback. */
export type RenderEditItemFormArgs<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
> = {
  /** search query, for seeding a value into a create form. */
  query?: string
  errors?: FieldErrors
  isRequired?: boolean
  onCancel?: () => void
  existingItem?: TEmbeddedItem | TPage
  /**
   * cb for progressive-disclosure forms to report when their main field
   * (e.g. a link's URL) is filled. A single-item picker uses this to drop
   * the combobox's back-to-search toggle once the form is underway.
   */
  onReadyChange?: (isReady: boolean) => void
  /**
   * cb for forms with async work (e.g. embed codes fetching oEmbeds)
   * that must resolve before a new item is saved.
   */
  onBusyChange?: (isBusy: boolean) => void
}

type ItemPickerSharedProps<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient,
  S extends PageDataResponse | undefined
> = {
  /** Server-seeded first page. Omit to fetch on mount. */
  initialResults?: ResultsResponse<TEmbeddedItem, TPage, S>
  label?: string
  description?: string
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
  renderExistingResult: (
    item: TEmbeddedItem | TPage,
    onRemove?: () => void,
    removeLabel?: string,
    extraActions?: React.ReactNode
  ) => React.ReactNode

  renderEditItemForm?: (
    args: RenderEditItemFormArgs<TEmbeddedItem, TPage>
  ) => React.ReactNode
  /**
   * currently only omitted in tests
   */
  schema?: z.ZodTypeAny
  /**
   * Renders the collapsed chip for a saved-but-unsubmitted "new" slot
   * (see `saveNewSlot`). `data` is the slot's fieldset values, already
   * collected + `normalizeFormData`-normalized the same way `schema`
   * validation reads them. Use this for item types whose `renderExistingResult`
   * can't render an unsaved item (e.g. `images`, which needs an s3 `url`).
   */
  renderNewItemSummary?: (
    data: Record<string, unknown>,
    previewUrl: string | undefined,
    actions: { onEdit: () => void; onRemove: () => void }
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
    | {
        isMulti: true
        name: string
        existingItems?: (TEmbeddedItem | TPage)[]
      }
  )

type Slot<TEmbeddedItem, TPage> =
  | { kind: 'existing'; item: TEmbeddedItem | TPage }
  | {
      kind: 'new'
      query?: string
      tempId: string
      /** Set once the slot's Save action has validated it — the
       * fieldset stays mounted but collapses into a chip. */
      saved?: boolean
      /**
       * Set once the user edits any field in the slot's fieldset.
       */
      touched?: boolean
      /** Object URL for the slot's picked file, created on Save and
       * revoked on Edit/remove. */
      previewUrl?: string
      /**
       * Snapshot of the fieldset's collected + normalized values,
       * taken on Save for the collapsed chip to render from — reading
       * the live fieldset via ref during render isn't allowed, and the
       * fieldset is hidden (non-interactive) anyway while saved.
       */
      summaryData?: Record<string, unknown>
    }
  | {
      /**
       * An existing item opened for inline editing — reuses the whole
       * `new`-slot fieldset/collapse lifecycle (hence the shared
       * `tempId`/`saved`/`touched`/`previewUrl`/`summaryData` fields),
       * but carries the source `item` so it can seed the edit form and
       * submit a hidden `id` alongside its edited fields (server sees id
       * + fields → an `edited` entry that UPDATEs rather than creates).
       */
      kind: 'editing'
      item: TEmbeddedItem | TPage
      tempId: string
      saved?: boolean
      touched?: boolean
      previewUrl?: string
      summaryData?: Record<string, unknown>
    }

/** A slot with a mounted edit fieldset: a new item or an edited existing one. */
type DraftSlot<TEmbeddedItem, TPage> = Extract<
  Slot<TEmbeddedItem, TPage>,
  { kind: 'new' | 'editing' }
>

function isDraftSlot<TEmbeddedItem, TPage>(
  slot: Slot<TEmbeddedItem, TPage>
): slot is DraftSlot<TEmbeddedItem, TPage> {
  return slot.kind === 'new' || slot.kind === 'editing'
}

function slotId(slot: Slot<unknown, unknown>): string {
  return slot.kind === 'existing' || slot.kind === 'editing'
    ? (slot.item as { id: string }).id
    : slot.tempId
}

/**
 * A "new" slot's creation order, parsed from its `tempId` (`new-0`,
 * `new-1`, ... as `addNew` mints them). Used to render fieldsets in a
 * fixed order that never changes as chips reorder, so a slot's file
 * input is never remounted.
 */
function newSlotSeq(slot: { tempId: string }): number {
  return Number(slot.tempId.replace('new-', ''))
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
    initialResults,
    searchParams,
    isRequired,
    itemType,
    label,
    description,
    name,
    renderExistingResult,
    renderEditItemForm,
    isMulti,
    featured,
    schema,
    renderNewItemSummary
  } = props

  const singleIdFieldName = itemIdFieldName(itemType, name)

  // Search-first types default to the search input rather than a blank
  // create form because their first field is free text (`venue.name`,
  // `publisher.name`) the search box can capture directly. Types whose first
  // field is a URL/iframe/file default to create.
  const searchFirstItemTypes = ['venues', 'publishers'] as const
  const isSearchFirst =
    !!renderEditItemForm &&
    (searchFirstItemTypes as readonly string[]).includes(itemType)
  const isCreateFirst = !!renderEditItemForm && !isSearchFirst

  const hasExistingItems = isMulti
    ? (props.existingItems?.length ?? 0) > 0
    : !!props.existingItem

  const [mode, setMode] = useState<'create' | 'search'>(
    isMulti && isCreateFirst ? 'create' : 'search'
  )

  const startWithBlankSlot =
    mode === 'create' ||
    (!isMulti && isCreateFirst && !hasExistingItems)

  const nextTempId = useRef(startWithBlankSlot ? 1 : 0)
  const [slots, setSlots] = useState<Slot<TEmbeddedItem, TPage>[]>(
    () => {
      const existing = isMulti
        ? (props.existingItems ?? []).map((item) => ({
            kind: 'existing' as const,
            item
          }))
        : props.existingItem
          ? [{ kind: 'existing' as const, item: props.existingItem }]
          : []
      if (!startWithBlankSlot) return existing
      const blank = { kind: 'new' as const, tempId: 'new-0' }
      // Keep an initially-featured item pinned at the head. The blank
      // create form joins the rest just after it.
      if (featured?.isInitiallyFeatured && existing.length > 0) {
        return [existing[0], blank, ...existing.slice(1)]
      }
      return [blank, ...existing]
    }
  )
  const [isFeatured, setIsFeatured] = useState(
    featured?.isInitiallyFeatured ?? false
  )
  const [isMainFieldReady, setIsMainFieldReady] = useState(false)
  const [newSlotErrors, setNewSlotErrors] = useState<
    Record<string, FieldErrors>
  >({})
  // Per-draft-slot flag, keyed by tempId: true while the slot's edit form
  // has async work in flight (see `renderEditItemForm`'s `onBusyChange`).
  const [busySlots, setBusySlots] = useState<Record<string, boolean>>(
    {}
  )
  // The existing item the user asked to open for inline editing. A fresh
  // object per request (so re-editing the same id refires) set by a
  // ref-free onClick — keeping `renderSlot` out of the refs lint rule.
  // The ref work (tempId mint + focus) happens in an effect below.
  const [editRequest, setEditRequest] = useState<{
    id: string
  } | null>(null)
  const newSlotFieldsets = useRef(
    new Map<string, HTMLFieldSetElement>()
  )
  // Collapsed-chip DOM nodes, so we can move focus into a chip after
  // its editor collapses via Save (see `pendingChipFocusTempId`).
  const newSlotChips = useRef(new Map<string, HTMLDivElement>())
  // tempId of a slot whose chip should receive focus on the next
  // render, set when the Save button collapses a fieldset out from
  // under the user's focus.
  const pendingChipFocusTempId = useRef<string | null>(null)
  // tempId of a freshly opened create editor to focus on next render.
  const pendingCreateFocusTempId = useRef<string | null>(null)
  // Set when a multi picker toggles back to search, so the search
  // input refocuses on the next render.
  const pendingComboboxFocus = useRef(false)
  // The picker's root, so the combobox can refocus.
  const rootRef = useRef<HTMLDivElement>(null)
  // Slot count as of the last commit, so the combobox-refocus effect can
  // detect a single-item picker emptying (1 → 0).
  const prevSlotCount = useRef(slots.length)

  const slotsRef = useRef(slots)
  useEffect(() => {
    slotsRef.current = slots
  }, [slots])
  useEffect(() => {
    return () => {
      slotsRef.current.forEach((slot) => {
        if (isDraftSlot(slot) && slot.previewUrl) {
          URL.revokeObjectURL(slot.previewUrl)
        }
      })
    }
  }, [])

  const itemLabel = label || itemTypeToLabel(itemType, true)
  const newLabel = `New ${itemTypeToLabel(itemType, true, true)}`
  const saveLabel = `Save ${itemTypeToLabel(itemType, true, true)}`
  const removeLabel = `Remove ${itemTypeToLabel(itemType, true, true)}`
  const featuredLabel = featured?.label || 'Featured'

  const featuredSlot = featured && isFeatured ? slots[0] : undefined
  const restSlots = featuredSlot ? slots.slice(1) : slots
  // Draft slots (new + edited-existing) both carry a mounted fieldset.
  const newRestSlots = restSlots.filter(isDraftSlot)
  // A saved draft slot's `<input type=file>` can't be repopulated, so
  // its fieldset must never move containers or reorder (either remounts
  // it and drops the file). So the always-mounted draft fieldsets render
  // on their own in a fixed creation order that never changes, while the
  // *chips* — which carry no file input — reorder freely. Since existing
  // slots are likewise fieldset-free, their results and the saved draft
  // chips share ONE sortable list (`sortableSlots`); only open editors
  // (`openNewSlots`) stay fixed, ahead of it.
  const openNewSlots = newRestSlots.filter((slot) => !slot.saved)
  const stableNewSlots = [...newRestSlots].sort(
    (a, b) => newSlotSeq(a) - newSlotSeq(b)
  )
  const sortableSlots = restSlots.filter(
    (slot) => slot.kind === 'existing' || slot.saved
  )
  // A slot's submit/action index is its position in the canonical rest
  // order — open editors first, then the sortable chips — offset past
  // any pinned featured slot at the array head.
  const orderedRest = [...openNewSlots, ...sortableSlots]
  const restIndex = (slot: Slot<TEmbeddedItem, TPage>) =>
    orderedRest.indexOf(slot) + (featuredSlot ? 1 : 0)

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

  function removeSlot(slot: Slot<TEmbeddedItem, TPage>) {
    if (featuredSlot && slotId(featuredSlot) === slotId(slot)) {
      setIsFeatured(false)
    }
    setSlots((current) => {
      const index = current.findIndex(
        (s) => slotId(s) === slotId(slot)
      )
      if (index === -1) return current
      const removed = current[index]
      if (isDraftSlot(removed)) {
        setNewSlotErrors(({ [removed.tempId]: _, ...rest }) => rest)
        setBusySlots(({ [removed.tempId]: _, ...rest }) => rest)
        if (removed.previewUrl)
          URL.revokeObjectURL(removed.previewUrl)
      }
      return current.filter((_, i) => i !== index)
    })
  }

  function addExisting(item: TEmbeddedItem | TPage) {
    setSlots((current) => {
      if (
        current.some(
          (s) =>
            (s.kind === 'existing' || s.kind === 'editing') &&
            s.item.id === item.id
        )
      ) {
        return current
      }
      return insertSlot(current, { kind: 'existing', item })
    })
  }

  /**
   * Cancels an in-progress edit of an existing item, restoring its
   * read-only `existing` chip and discarding the edits — the editing
   * counterpart to discarding a `new` draft (which removes it entirely).
   * Ref-free (setState only) so render helpers can reference it; the
   * caller owns any pending-focus ref write.
   */
  function revertEditingSlot(slot: Slot<TEmbeddedItem, TPage>) {
    if (slot.kind !== 'editing') return
    if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl)
    setNewSlotErrors(({ [slot.tempId]: _, ...rest }) => rest)
    setSlots((current) =>
      current.map((s) =>
        slotId(s) === slotId(slot)
          ? { kind: 'existing' as const, item: slot.item }
          : s
      )
    )
  }

  function addNew(query?: string) {
    const tempId = `new-${nextTempId.current++}`
    setSlots((current) =>
      insertSlot(current, { kind: 'new', query, tempId })
    )
    return tempId
  }

  function setNewSlotFieldsetRef(
    tempId: string,
    el: HTMLFieldSetElement | null
  ) {
    if (el) newSlotFieldsets.current.set(tempId, el)
    else newSlotFieldsets.current.delete(tempId)
  }

  function setNewSlotChipRef(
    tempId: string,
    el: HTMLDivElement | null
  ) {
    if (el) newSlotChips.current.set(tempId, el)
    else newSlotChips.current.delete(tempId)
  }

  // Opens an already-attached item for inline editing (requested via
  // `editRequest`): swaps its read-only `existing` slot for an `editing`
  // slot (same item, fresh tempId) that mounts the edit fieldset seeded
  // with the item, then hands off to the create-focus effect. Runs from
  // an effect rather than the onClick so the ref access (tempId mint +
  // focus) stays out of render (see `editRequest`); reuses the shared
  // `new-` tempId sequence so `newSlotSeq` orders the fieldset normally.
  useEffect(() => {
    if (!editRequest) return
    const id = editRequest.id
    const target = slotsRef.current.find(
      (s) => s.kind === 'existing' && slotId(s) === id
    )
    if (!target) return
    const tempId = `new-${nextTempId.current++}`
    // Hide untouched-blank create form when editor opens, only one
    // form is open at once (create mode re-seeds on editor close).
    setSlots((current) =>
      current
        .filter((s) => !(s.kind === 'new' && !s.saved && !s.touched))
        .map((s) =>
          s.kind === 'existing' && slotId(s) === id
            ? { kind: 'editing' as const, item: s.item, tempId }
            : s
        )
    )
    pendingCreateFocusTempId.current = tempId
  }, [editRequest])

  // When Save collapses a fieldset, its Save button (which had focus)
  // is hidden and replaced by a chip — move focus to that chip's Edit
  // control so keyboard/screen-reader users aren't dropped on <body>.
  useEffect(() => {
    const tempId = pendingChipFocusTempId.current
    if (!tempId) return
    pendingChipFocusTempId.current = null
    const chip = newSlotChips.current.get(tempId)
    if (!chip) return
    const editButton = Array.from(
      chip.querySelectorAll('button')
    ).find((b) => b.textContent?.trim() === 'Edit')
    ;(editButton ?? chip.querySelector('button'))?.focus()
  }, [slots])

  // Focus the first field of a freshly opened create editor so the
  // user lands in the form rather than on <body> after the search
  // input is hidden.
  useEffect(() => {
    const tempId = pendingCreateFocusTempId.current
    if (!tempId) return
    pendingCreateFocusTempId.current = null
    const fieldset = newSlotFieldsets.current.get(tempId)
    fieldset
      ?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea'
      )
      ?.focus()
  }, [slots])

  // Refocus the search input after a multi picker toggles back to
  // search from create mode, so focus isn't dropped on <body>.
  useEffect(() => {
    if (!pendingComboboxFocus.current) return
    pendingComboboxFocus.current = false
    rootRef.current
      ?.querySelector<HTMLElement>('[role="combobox"]')
      ?.focus()
  }, [slots])

  // A single-item picker emptying (1 → 0 slots) means its open create
  // form was abandoned — via the image preview's X (the escape hatch),
  // the Cancel button, or removing the saved chip — which restores the
  // combobox (`showCombobox`). The control that triggered it unmounts
  // with the form, so move focus to the reappearing search input rather
  // than let it drop to <body>. Guarded on the 1 → 0 transition so an
  // initially-empty picker doesn't grab focus on mount.
  useEffect(() => {
    const wasNonEmpty = prevSlotCount.current > 0
    prevSlotCount.current = slots.length
    if (isMulti || !wasNonEmpty || slots.length !== 0) return
    rootRef.current
      ?.querySelector<HTMLElement>('[role="combobox"]')
      ?.focus()
  }, [slots, isMulti])

  function isValidatable(
    el: Element
  ): el is
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement {
    return 'willValidate' in el && 'checkValidity' in el
  }

  /**
   * The prefix a "new" slot's fields are rendered with, provided to the
   * slot's edit form and stripped when reading it back:
   * `${name}[${index}].` for `isMulti`, the single id field's name
   * without its `Id` suffix (`venue.`, `coverImage.`) for a single
   * item — matching how `extractIndexedGroups` and the `resolve*Id`
   * helpers strip the same prefix server-side from the real
   * submission.
   */
  function slotFieldPrefix(submitIndex: number): string {
    if (isMulti) return indexedItemFieldPrefix(name, submitIndex)
    return itemFieldPrefix(singleIdFieldName)
  }

  /**
   * strip `slotFieldPrefix`.
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
   * Validates a "new" slot, updating `newSlotErrors` with Zod errors.
   * Always valid (a no-op) for item types (e.g. `images`) whose schema
   * needs data not yet available client-side.
   * Moves focus to the first invalid field  when blocking progress (adding
   * another slot). Omitted for the quieter blur-triggered check below,
   * which shouldn't fight the user's own tab navigation.
   */
  function validateNewSlot(
    slot: Slot<TEmbeddedItem, TPage>,
    submitIndex: number,
    options: { focus?: boolean } = {}
  ): boolean {
    if (!isDraftSlot(slot) || !schema) return true
    const fieldset = newSlotFieldsets.current.get(slot.tempId)
    if (!fieldset) return true

    const prefix = slotFieldPrefix(submitIndex)
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
   * Runs native `required`/`type` constraints (the only signal for
   * fields a schema can't see yet, e.g. embed codes' `iframe`
   * textarea, which isn't itself a schema field — only the
   * `host`/`src`/`type` parsed from it are) then `validateNewSlot`,
   * for a single slot — the full validate-and-focus sequence shared by
   * collapsing open slots on another entry (`saveOpenNewSlots`) and an
   * explicit Save.
   */
  function validateSlotStrict(
    slot: Slot<TEmbeddedItem, TPage>,
    submitIndex: number
  ): boolean {
    if (!isDraftSlot(slot)) return true
    const fieldset = newSlotFieldsets.current.get(slot.tempId)
    if (!fieldset) return true

    const invalid = Array.from(fieldset.elements)
      .filter(isValidatable)
      .find((el) => el.willValidate && !el.checkValidity())

    if (invalid) {
      invalid.reportValidity()
      return false
    }

    return validateNewSlot(slot, submitIndex, { focus: true })
  }

  function findFileInput(
    fieldset: HTMLFieldSetElement
  ): HTMLInputElement | undefined {
    return Array.from(fieldset.elements).find(
      (el): el is HTMLInputElement =>
        el instanceof HTMLInputElement && el.type === 'file'
    )
  }

  // Flag a draft slot as touched the first time the user edits any fields.
  // Returns `current` unchanged once already touched so repeated edits don't
  // re-render. See `Slot`'s `touched` for why untouched slots are pruned.
  function markSlotTouched(tempId: string) {
    setSlots((current) => {
      const target = current.find(
        (s) => isDraftSlot(s) && s.tempId === tempId
      )
      if (!target || !isDraftSlot(target) || target.touched) {
        return current
      }
      return current.map((s) =>
        isDraftSlot(s) && s.tempId === tempId
          ? { ...s, touched: true }
          : s
      )
    })
  }

  /**
   * Validates a single "new" slot and, on success, collapses it into
   * its saved state — the fieldset stays mounted, hidden, and renders
   * a chip in its place. Snapshots the fieldset's values (`summaryData`)
   * and, for any picked file, a `previewUrl`, since the collapsed chip
   * renders from state rather than reading the (now hidden, and
   * ref-only-outside-render) fieldset directly.
   */
  function saveNewSlot(
    slot: Slot<TEmbeddedItem, TPage>,
    submitIndex: number
  ): boolean {
    if (!isDraftSlot(slot)) return true
    if (!validateSlotStrict(slot, submitIndex)) return false

    const fieldset = newSlotFieldsets.current.get(slot.tempId)
    const prefix = slotFieldPrefix(submitIndex)
    const summaryData = fieldset
      ? normalizeFormData(collectSlotData(fieldset, prefix))
      : {}
    const file = fieldset && findFileInput(fieldset)?.files?.[0]
    const previewUrl = file ? URL.createObjectURL(file) : undefined

    setSlots((current) =>
      current.map((s) =>
        isDraftSlot(s) && s.tempId === slot.tempId
          ? { ...s, saved: true, previewUrl, summaryData }
          : s
      )
    )
    return true
  }

  /**
   * Re-expands a saved "new" slot for editing, revoking its preview
   * object URL — Save creates a fresh one when the slot is next saved.
   */
  function editNewSlot(slot: Slot<TEmbeddedItem, TPage>) {
    if (!isDraftSlot(slot)) return
    // Only one editor open at a time: drop any *other* still-untouched
    // create editor (the one Save auto-reopens for the next item) as
    // this slot re-expands, so editing doesn't leave a stray file input
    // open beside its edit form. Only `new` strays are disposable —
    // an untouched `editing` slot still owns an item, so it's never
    // pruned. Its `touched` is kept — the slot has content, so toggling
    // back to search should still fold it to a chip.
    const strayIds = new Set(
      slots
        .filter(
          (s) =>
            s.kind === 'new' &&
            !s.saved &&
            !s.touched &&
            s.tempId !== slot.tempId
        )
        .map((s) => (s as { tempId: string }).tempId)
    )
    if (strayIds.size > 0) {
      setNewSlotErrors((current) => {
        const next = { ...current }
        strayIds.forEach((id) => delete next[id])
        return next
      })
    }
    setSlots((current) =>
      current
        .filter((s) => !(s.kind === 'new' && strayIds.has(s.tempId)))
        .map((s) => {
          if (!isDraftSlot(s) || s.tempId !== slot.tempId) return s
          if (s.previewUrl) URL.revokeObjectURL(s.previewUrl)
          return {
            ...s,
            saved: false,
            previewUrl: undefined,
            summaryData: undefined
          }
        })
    )
  }

  /**
   * Collapses every still-open "new" slot into its saved chip. Run
   * when the user starts another entry, so completed slots fold up
   * instead of stacking open forms. Blocks (returns false)
   * as soon as an open slot is invalid, with `saveNewSlot`'s validation.
   */
  function saveOpenNewSlots(): boolean {
    for (const slot of slots) {
      if (!isDraftSlot(slot) || slot.saved) continue
      if (!saveNewSlot(slot, restIndex(slot))) return false
    }
    return true
  }

  /**
   * Whether a "new" slot passes native + schema validation *without*
   * reporting or focusing — used to decide collapse-vs-discard when the
   * user toggles back to search (a mode switch shouldn't nag with
   * validation bubbles the way an explicit Save does).
   */
  function isSlotComplete(slot: Slot<TEmbeddedItem, TPage>): boolean {
    if (!isDraftSlot(slot)) return true
    const fieldset = newSlotFieldsets.current.get(slot.tempId)
    if (!fieldset) return false
    const nativeValid = Array.from(fieldset.elements)
      .filter(isValidatable)
      .every((el) => !el.willValidate || el.checkValidity())
    if (!nativeValid) return false
    return validateNewSlot(slot, restIndex(slot))
  }

  /**
   * Toggle back to search from create mode: collapse a complete draft
   * into its chip, or discard an empty/incomplete one — either way the
   * open editor closes, so `showCombobox`/`hasOpenDraft` fall back to the
   * search input. Only one editor is ever open at a time (adding
   * another runs `saveOpenNewSlots` first), so the head slot suffices.
   *
   * An untouched editor (Save reopens one for the next item) is
   * discarded, not saved: for schemaless items like images its empty
   * form passes validation, so `isSlotComplete` alone would fold it into
   * a phantom chip.
   *
   * Sets the matching pending-focus ref for whichever happens: a
   * discarded slot leaves the search input as the thing to focus, but a
   * collapsed one replaces the editor with a chip (and, for a
   * single-item picker, can hide the combobox entirely — see
   * `showCombobox`) — so focus must follow to the chip's Edit control
   * instead, the same as the explicit Save button does.
   */
  function returnToSearch() {
    const open = openNewSlots[0]
    if (!open) return
    // An open edit of an existing item reverts to its chip rather than
    // being discarded — discarding would drop the attached item.
    if (open.kind === 'editing') {
      revertEditingSlot(open)
      pendingComboboxFocus.current = true
      return
    }
    if (open.touched && isSlotComplete(open)) {
      if (saveNewSlot(open, restIndex(open))) {
        pendingChipFocusTempId.current = open.tempId
      }
    } else {
      removeSlot(open)
      pendingComboboxFocus.current = true
    }
  }

  function setFeatured(slot: Slot<TEmbeddedItem, TPage>) {
    setSlots((current) => {
      const index = current.findIndex(
        (s) => slotId(s) === slotId(slot)
      )
      if (index === -1) return current
      const target = current[index]
      return [target, ...current.filter((_, i) => i !== index)]
    })
    setIsFeatured(true)
  }

  function featuredControl(
    slot: Slot<TEmbeddedItem, TPage>,
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
        onClick={() => setFeatured(slot)}
      >
        <StarIcon />
      </button>
    )
  }

  /** The collapsed chip for a saved draft (new or edited-existing) slot. */
  function renderNewItemChip(
    slot: DraftSlot<TEmbeddedItem, TPage>,
    dragHandle?: React.ReactNode
  ) {
    const actions = {
      onEdit: () => editNewSlot(slot),
      onRemove: () => removeSlot(slot)
    }
    const editButton = (
      <button
        type='button'
        className='button-sm'
        onClick={actions.onEdit}
      >
        Edit
      </button>
    )
    return (
      <div
        className={selectedResultStyles['selected-result']}
        ref={(el) => setNewSlotChipRef(slot.tempId, el)}
      >
        {dragHandle}
        <div className={selectedResultStyles['content']}>
          {slot.kind === 'editing' ? (
            // An edited existing item collapses back to its normal result
            // chip (merged with the edits), plus an Edit control to reopen.
            renderExistingResult(
              { ...slot.item, ...slot.summaryData } as
                | TEmbeddedItem
                | TPage,
              actions.onRemove,
              removeLabel,
              editButton
            )
          ) : renderNewItemSummary ? (
            renderNewItemSummary(
              slot.summaryData ?? {},
              slot.previewUrl,
              actions
            )
          ) : (
            <ItemResultLabel
              title={newLabel}
              onRemove={actions.onRemove}
              removeLabel={removeLabel}
              extraActions={editButton}
            />
          )}
        </div>
      </div>
    )
  }

  /**
   * The "new" slot's edit fieldset — kept mounted (never unmounted or
   * disabled) even once saved, only visually hidden — a picked
   * `<input type=file>` can't be programmatically repopulated, so its
   * live DOM node must survive a save→edit round-trip; `hidden` still
   * submits the fieldset's inputs on final form submit. The body is just
   * the create form: no visible legend or Cancel button (the combobox
   * header's "Search {item}" toggle is the way back to search), so an
   * `aria-label` names the group in the accessible tree in the legend's
   * place. A `featured` picker's star toggle is not surfaced here,
   * currently shown only on closed chips (see `featuredControl`).
   *
   * A sibling function (rather than a JSX value assigned to a local)
   * called directly from `renderSlot`, matching `renderSlot` itself —
   * assigning this fieldset's output (it carries a `ref` callback) to a
   * variable instead of returning it directly trips the
   * `react-hooks/refs` lint rule's ref-reachability analysis.
   */
  function renderNewFieldset(
    slot: DraftSlot<TEmbeddedItem, TPage>,
    submitIndex: number
  ) {
    const idInputName = isMulti
      ? `${indexedItemFieldPrefix(name, submitIndex)}id`
      : singleIdFieldName
    return (
      <fieldset
        hidden={slot.saved}
        className={itemPickerStyles['new-item-fieldset']}
        ref={(el) => setNewSlotFieldsetRef(slot.tempId, el)}
        onChange={() => markSlotTouched(slot.tempId)}
        // Multi-item slots are already validated when the user tries
        // to add another one (`saveOpenNewSlots`). Single-item
        // pickers validate on blur when focus leaves the fieldset.
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
                validateNewSlot(slot, submitIndex)
              }
        }
      >
        <legend className='visually-hidden'>
          {slot.kind === 'editing' ? itemLabel : newLabel}
        </legend>
        {/* An edited existing item submits its id alongside the edited
            fields, so the server UPDATEs it (an `edited` entry) rather
            than creating a duplicate. */}
        {slot.kind === 'editing' && idInputName && (
          <input
            type='hidden'
            name={idInputName}
            value={slot.item.id}
            readOnly
          />
        )}
        <NamePrefixProvider prefix={slotFieldPrefix(submitIndex)}>
          {renderEditItemForm?.({
            query: slot.kind === 'new' ? slot.query : undefined,
            errors: newSlotErrors[slot.tempId],
            isRequired: isRequired ?? false,
            // Single-item pickers replace their combobox with this form,
            // so removing the slot returns to search — wire that as the
            // create form's own cancel (e.g. the image preview's X). Multi
            // keeps its always-present combobox, so its Cancel button
            // suffices and no create-form cancel is passed.
            onCancel: isMulti ? undefined : () => removeSlot(slot),
            onReadyChange: isMulti ? undefined : setIsMainFieldReady,
            existingItem:
              slot.kind === 'editing' ? slot.item : undefined,
            onBusyChange: (isBusy: boolean) =>
              setBusySlots((current) =>
                current[slot.tempId] === isBusy
                  ? current
                  : { ...current, [slot.tempId]: isBusy }
              )
          })}
        </NamePrefixProvider>
        <div
          className={`${itemPickerStyles['create-form-actions']} ${
            isSearchFirst || slot.kind === 'editing'
              ? itemPickerStyles['create-form-actions-visible']
              : ''
          }`}
        >
          <button
            type='button'
            className={`button-primary ${itemPickerStyles['save-button']}`}
            disabled={busySlots[slot.tempId]}
            onClick={() => {
              if (!saveNewSlot(slot, submitIndex)) return
              // After saving a *new* item, reopen an empty editor for the
              // next one. A saved edit collapses to its chip.
              if (isMulti && slot.kind === 'new') {
                pendingCreateFocusTempId.current = addNew()
              } else if (
                isMulti &&
                slot.kind === 'editing' &&
                mode === 'create'
              ) {
                pendingCreateFocusTempId.current = addNew()
              } else {
                pendingChipFocusTempId.current = slot.tempId
              }
            }}
          >
            {saveLabel}
          </button>
          {slot.kind === 'editing' && (
            <button
              type='button'
              className='button-sm'
              onClick={() => {
                revertEditingSlot(slot)
                if (mode === 'create') {
                  pendingCreateFocusTempId.current = addNew()
                } else {
                  pendingComboboxFocus.current = true
                }
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </fieldset>
    )
  }

  function renderSlot(
    slot: Slot<TEmbeddedItem, TPage>,
    index: number,
    dragHandle?: React.ReactNode,
    featuredButton?: React.ReactNode
  ) {
    return slot.kind === 'existing' ? (
      (() => {
        const Wrapper: 'div' | 'fieldset' = isMulti
          ? 'div'
          : 'fieldset'

        const editButton = !!renderEditItemForm ? (
          <button
            type='button'
            className='button-sm'
            onClick={() => setEditRequest({ id: slot.item.id })}
          >
            Edit
          </button>
        ) : undefined
        const extraActions =
          editButton || featuredButton ? (
            <>
              {editButton}
              {featuredButton}
            </>
          ) : undefined

        return (
          <Wrapper
            className={itemPickerStyles['existing-item-wrapper']}
          >
            {!isMulti && (
              <InputLabel
                as='legend'
                isRequired={isRequired}
                label={itemLabel}
                description={description}
              />
            )}
            <SelectedResult
              itemType={itemType}
              name={
                isMulti
                  ? `${indexedItemFieldPrefix(name, index)}id`
                  : singleIdFieldName
              }
              id={slot.item.id}
              dragHandle={dragHandle}
            >
              {renderExistingResult(
                slot.item,
                () => removeSlot(slot),
                removeLabel,
                extraActions
              )}
            </SelectedResult>
          </Wrapper>
        )
      })()
    ) : isMulti ? (
      <>
        {slot.saved && renderNewItemChip(slot, dragHandle)}
        {renderNewFieldset(slot, index)}
      </>
    ) : (
      <div className={itemPickerStyles['draft-wrapper']}>
        {!hasOpenDraft && (
          <div>
            <InputLabel
              isRequired={isRequired}
              label={itemLabel}
              description={description}
            />
          </div>
        )}
        {slot.saved && renderNewItemChip(slot)}
        {renderNewFieldset(slot, index)}
      </div>
    )
  }

  /**
   * One reorderable chip in the shared sortable list: an existing item's
   * result, or a saved-new slot's collapsed chip (its fieldset lives in
   * the fixed list, so only the chip is rendered here).
   */
  function renderSortableRow(
    slot: Slot<TEmbeddedItem, TPage>,
    dragHandle?: React.ReactNode
  ) {
    const index = restIndex(slot)
    return slot.kind === 'existing'
      ? renderSlot(
          slot,
          index,
          dragHandle,
          featuredControl(slot, false)
        )
      : renderNewItemChip(slot, dragHandle)
  }

  // While a draft editor is open  the combobox stays mounted but
  // hides its search input, swapping the "New {item}" button for a
  // "Search {item}" toggle. Search and create are never shown at once.
  const hasOpenDraft = slots.some(
    (slot) => isDraftSlot(slot) && !slot.saved
  )
  // Multi always shows the combobox, single shows it only to search
  // (empty list) or while a draft is open (the toggle carries label + Search).
  const showCombobox = isMulti || slots.length === 0 || hasOpenDraft

  return (
    <div
      className={`${itemPickerStyles['item-picker']} ${
        !isMulti ? itemPickerStyles['item-picker-single'] : ''
      }`}
      ref={rootRef}
    >
      {isMulti && (
        <input
          name={emptyListFieldName(name)}
          type='hidden'
          value=''
          readOnly
        />
      )}

      {isMulti && featuredSlot && (
        <input
          name={featuredFlagFieldName(name)}
          type='hidden'
          value='true'
          readOnly
        />
      )}

      {showCombobox && (
        <Combobox<TEmbeddedItem, TPage, S>
          label={label}
          description={description}
          isRequired={isRequired}
          initialResults={initialResults}
          searchParams={searchParams}
          itemType={itemType}
          isCreating={hasOpenDraft}
          // Hidden if single-picker & open slot's main field is valid,
          // so the toggle can't discard entered content.
          onBackToSearch={
            !isMulti && isMainFieldReady
              ? undefined
              : () => {
                  setMode('search')
                  returnToSearch()
                }
          }
          renderExistingResult={renderExistingResult}
          onCreateNew={
            renderEditItemForm
              ? (q) => {
                  // Collapse open slot(s) before adding another.
                  if (!saveOpenNewSlots()) return
                  setMode('create')
                  pendingCreateFocusTempId.current = addNew(
                    q || undefined
                  )
                }
              : undefined
          }
          onSelect={addExisting}
        />
      )}

      {featuredSlot && (
        <div className='featured-slot'>
          {renderSlot(
            featuredSlot,
            0,
            undefined,
            featuredControl(featuredSlot, true)
          )}
        </div>
      )}

      {/*
       * New slots' always-mounted fieldsets render on their own, in a
       * fixed creation order that never reorders — reordering (or moving
       * containers) would remount them and drop their picked file. Open
       * editors show here and aren't draggable; the collapsed chips
       * (below) carry no file input, so they reorder freely.
       */}
      {isMulti &&
        newRestSlots.length > 0 &&
        stableNewSlots.map((slot) => (
          <div
            key={slotId(slot)}
            className={itemPickerStyles['item-picker-multi-slot']}
          >
            {renderNewFieldset(slot, restIndex(slot))}
          </div>
        ))}

      {/*
       * One sortable list for every chip — existing-item results and
       * collapsed saved-new slots together — so they reorder relative to
       * one another. Drag controls appear only with more than one chip.
       */}
      {isMulti ? (
        sortableSlots.length > 1 ? (
          <SortableList
            className={itemPickerStyles['item-list']}
            items={sortableSlots.map((slot) => ({
              id: slotId(slot),
              slot
            }))}
            onReorder={(reordered) =>
              setSlots([
                ...(featuredSlot ? [featuredSlot] : []),
                ...openNewSlots,
                ...reordered.map((entry) => entry.slot)
              ])
            }
            renderItem={(entry, _index, dragHandle) =>
              renderSortableRow(entry.slot, dragHandle)
            }
          />
        ) : (
          sortableSlots.length === 1 && (
            <div className={itemPickerStyles['item-list']}>
              {renderSortableRow(sortableSlots[0])}
            </div>
          )
        )
      ) : (
        restSlots.length > 0 && (
          <>
            {restSlots.map((slot, index) => (
              <div
                className={
                  itemPickerStyles['item-picker-single-slot']
                }
                key={slotId(slot)}
              >
                {renderSlot(
                  slot,
                  index,
                  undefined,
                  featuredControl(slot, false)
                )}
              </div>
            ))}
          </>
        )
      )}
    </div>
  )
}
