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
import { InputLabel } from '@/ui/form/input-label'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import { ItemResultLabel } from '@/ui/item-result-label'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import selectedResultStyles from '@/ui/selected-results/selected-results.module.scss'
import type { ResultsResponse } from '@/ui/useResultsList'
import type { SearchParams } from '@/ui/util'

type FieldErrors = Record<string, string[] | undefined>

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
    query: string | undefined,
    index?: number,
    errors?: FieldErrors,
    isRequired?: boolean,
    onCancel?: () => void,
    onMainFieldReadyChange?: (isReady: boolean) => void
  ) => React.ReactNode
  /**
   * omit for item types whose schema needs data unavailable client-side
   * (e.g. `images`, where `url` is generated from server-side S3 upload).
   */
  schema?: z.ZodTypeAny
  /**
   * For single-item pickers only: the prefix the inline-create form
   * namespaces its inputs with (mirrors `EditImage`'s `namePrefix`,
   * e.g. `'coverImage'` → `coverImage.title`). Used to strip that prefix
   * when collecting a slot's values for `schema` validation and
   * `renderNewItemSummary`, the same way the `${name}[i].` bracket prefix
   * is stripped for `isMulti`. Omit when the create form's inputs aren't
   * namespaced.
   */
  namePrefix?: string
  /**
   * Renders the collapsed chip for a saved-but-unsubmitted "new" slot
   * (see `saveNewSlot`). `data` is the slot's fieldset values, already
   * collected + `normalizeFormData`-normalized the same way `schema`
   * validation reads them; `previewUrl` is the object URL of the
   * picked file, if any. Falls back to a minimal generic chip (label +
   * Edit + remove) when omitted — pass this for item types whose
   * `renderExistingResult` can't render an unsaved item (e.g. `images`, which
   * needs a real uploaded `url`).
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
    | { isMulti: true; existingItems?: (TEmbeddedItem | TPage)[] }
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

function slotId(slot: Slot<unknown, unknown>): string {
  return slot.kind === 'existing'
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
    renderNewItemSummary,
    namePrefix
  } = props

  // "New" is the default mode: an empty, create-capable picker opens
  // with one create slot already open, so the combobox starts in its
  // create state (showing the "Search {item}" toggle back). Populated
  // pickers keep showing their items; pickers with no inline-create
  // (`renderEditItemForm` omitted, e.g. page items) stay in search.
  // Toggling back to search discards the still-empty slot as usual.
  const hasExistingItems = isMulti
    ? (props.existingItems?.length ?? 0) > 0
    : !!props.existingItem
  const startInCreateMode = !!renderEditItemForm && !hasExistingItems

  const nextTempId = useRef(startInCreateMode ? 1 : 0)
  const [slots, setSlots] = useState<Slot<TEmbeddedItem, TPage>[]>(
    () => {
      if (startInCreateMode) {
        return [{ kind: 'new' as const, tempId: 'new-0' }]
      }
      const existing = isMulti
        ? (props.existingItems ?? []).map((item) => ({
            kind: 'existing' as const,
            item
          }))
        : props.existingItem
          ? [{ kind: 'existing' as const, item: props.existingItem }]
          : []
      return existing
    }
  )
  const [isFeatured, setIsFeatured] = useState(
    featured?.isInitiallyFeatured ?? false
  )
  const [isMainFieldReady, setIsMainFieldReady] = useState(false)
  const [newSlotErrors, setNewSlotErrors] = useState<
    Record<string, FieldErrors>
  >({})
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
        if (slot.kind === 'new' && slot.previewUrl) {
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
  const newRestSlots = restSlots.filter(
    (
      slot
    ): slot is Extract<Slot<TEmbeddedItem, TPage>, { kind: 'new' }> =>
      slot.kind === 'new'
  )
  // A saved `new` slot's `<input type=file>` can't be repopulated, so
  // its fieldset must never move containers or reorder (either remounts
  // it and drops the file). So the always-mounted new fieldsets render
  // on their own in a fixed creation order that never changes, while the
  // *chips* — which carry no file input — reorder freely. Since existing
  // slots are likewise fieldset-free, their results and the saved-new
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
      if (removed.kind === 'new') {
        setNewSlotErrors(({ [removed.tempId]: _, ...rest }) => rest)
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
          (s) => s.kind === 'existing' && s.item.id === item.id
        )
      ) {
        return current
      }
      return insertSlot(current, { kind: 'existing', item })
    })
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
   * The prefix a "new" slot's fields are rendered with, stripped when
   * reading them back: `${name}[${index}].` for `isMulti`, or the
   * single-item create form's `namePrefix` (e.g. `coverImage.`)
   * when set — matching how `extractIndexedGroups`/`resolveCoverImageId`
   * strip the same prefix server-side from the real submission.
   */
  function slotFieldPrefix(submitIndex: number): string {
    if (isMulti) return `${name}[${submitIndex}].`
    return namePrefix ? `${namePrefix}.` : ''
  }

  /**
   * Reads a "new" slot's fieldset back into the flat shape its create
   * schema expects, stripping the `slotFieldPrefix` those fields are
   * rendered with.
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
    slot: Slot<TEmbeddedItem, TPage>,
    submitIndex: number,
    options: { focus?: boolean } = {}
  ): boolean {
    if (slot.kind !== 'new' || !schema) return true
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
    if (slot.kind !== 'new') return true
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

  // Flag a "new" slot as touched the first time the user edits any fields.
  // Returns `current` unchanged once already touched so repeated edits don't
  // re-render. See `Slot`'s `touched` for why untouched slots are pruned.
  function markSlotTouched(tempId: string) {
    setSlots((current) => {
      const target = current.find(
        (s) => s.kind === 'new' && s.tempId === tempId
      )
      if (!target || target.kind !== 'new' || target.touched) {
        return current
      }
      return current.map((s) =>
        s.kind === 'new' && s.tempId === tempId
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
    if (slot.kind !== 'new') return true
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
        s.kind === 'new' && s.tempId === slot.tempId
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
    if (slot.kind !== 'new') return
    // Only one editor open at a time: drop any *other* still-untouched
    // create editor (the one Save auto-reopens for the next item) as
    // this slot re-expands, so editing doesn't leave a stray file input
    // open beside its edit form. Its `touched` is kept — the slot has
    // content, so toggling back to search should still fold it to a chip.
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
          if (s.kind !== 'new' || s.tempId !== slot.tempId) return s
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
      if (slot.kind !== 'new' || slot.saved) continue
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
    if (slot.kind !== 'new') return true
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
   * open editor closes, so `showCombobox`/`isCreating` fall back to the
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

  /** The collapsed chip for a saved "new" slot. */
  function renderNewItemChip(
    slot: Extract<Slot<TEmbeddedItem, TPage>, { kind: 'new' }>,
    dragHandle?: React.ReactNode
  ) {
    const actions = {
      onEdit: () => editNewSlot(slot),
      onRemove: () => removeSlot(slot)
    }
    return (
      <div
        className={selectedResultStyles['selected-result']}
        ref={(el) => setNewSlotChipRef(slot.tempId, el)}
      >
        {dragHandle}
        <div className={selectedResultStyles['content']}>
          {renderNewItemSummary ? (
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
              extraActions={
                <button
                  type='button'
                  className='button-sm'
                  onClick={actions.onEdit}
                >
                  Edit
                </button>
              }
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
   * place. A `featured` picker still surfaces its star toggle here, in a
   * minimal legend, once the slot's required fields are satisfied.
   *
   * A sibling function (rather than a JSX value assigned to a local)
   * called directly from `renderSlot`, matching `renderSlot` itself —
   * assigning this fieldset's output (it carries a `ref` callback) to a
   * variable instead of returning it directly trips the
   * `react-hooks/refs` lint rule's ref-reachability analysis.
   */
  function renderNewFieldset(
    slot: Extract<Slot<TEmbeddedItem, TPage>, { kind: 'new' }>,
    submitIndex: number
  ) {
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
        <legend className='visually-hidden'>{newLabel}</legend>
        {renderEditItemForm?.(
          slot.query,
          isMulti ? submitIndex : undefined,
          newSlotErrors[slot.tempId],
          isRequired ?? false,
          // Single-item pickers replace their combobox with this form,
          // so removing the slot returns to search — wire that as the
          // create form's own cancel (e.g. the image preview's X). Multi
          // keeps its always-present combobox, so its Cancel button
          // suffices and no create-form cancel is passed.
          isMulti ? undefined : () => removeSlot(slot),
          isMulti ? undefined : setIsMainFieldReady
        )}
        <button
          type='button'
          className={`button-primary ${itemPickerStyles['save-button']}`}
          onClick={() => {
            if (!saveNewSlot(slot, submitIndex)) return
            if (isMulti) {
              pendingCreateFocusTempId.current = addNew()
            } else {
              pendingChipFocusTempId.current = slot.tempId
            }
          }}
        >
          {saveLabel}
        </button>
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
              name={isMulti ? `${name}[${index}].id` : name}
              id={slot.item.id}
              dragHandle={dragHandle}
            >
              {renderExistingResult(
                slot.item,
                () => removeSlot(slot),
                removeLabel,
                featuredButton
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
      <fieldset className={itemPickerStyles['existing-item-wrapper']}>
        {/* While creating, the mounted combobox header carries the
            label + Search toggle; once collapsed to a chip the combobox
            is gone, so this fieldset provides the label itself. */}
        {!isCreating && (
          <InputLabel
            as='legend'
            isRequired={isRequired}
            label={itemLabel}
            description={description}
          />
        )}
        {slot.saved && renderNewItemChip(slot)}
        {renderNewFieldset(slot, index)}
      </fieldset>
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

  // While a create editor is open the combobox stays mounted but hides
  // its search body, swapping the "New {item}" button for a "Search
  // {item}" toggle, so search and create are never shown at once — for
  // both multi and single pickers (its header carries the label).
  const isCreating = slots.some(
    (slot) => slot.kind === 'new' && !slot.saved
  )
  // Multi always shows the combobox; single shows it only to search
  // (empty list) or while creating (the toggle carries label + Search).
  const showCombobox = isMulti || slots.length === 0 || isCreating

  return (
    <div className={itemPickerStyles['item-picker']} ref={rootRef}>
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
          description={description}
          isRequired={isRequired}
          initialResults={initialResults}
          searchParams={searchParams}
          itemType={itemType}
          isCreating={isCreating}
          // Hidden if single-picker & open slot's main field is valid,
          // so the toggle can't discard entered content.
          onBackToSearch={
            !isMulti && isMainFieldReady ? undefined : returnToSearch
          }
          renderExistingResult={renderExistingResult}
          onCreateNew={
            renderEditItemForm
              ? (q) => {
                  // Collapse open slot(s) before adding another.
                  if (!saveOpenNewSlots()) return
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
        <div>
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
      {isMulti && newRestSlots.length > 0 && (
        <div>
          {stableNewSlots.map((slot) => (
            <div key={slotId(slot)}>
              {renderNewFieldset(slot, restIndex(slot))}
            </div>
          ))}
        </div>
      )}

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
          <div className={itemPickerStyles['item-list']}>
            {restSlots.map((slot, index) => (
              <div key={slotId(slot)}>
                {renderSlot(
                  slot,
                  index,
                  undefined,
                  featuredControl(slot, false)
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
