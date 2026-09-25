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
   * `${singular(itemType)}Id`, or to `itemType` itself as the array
   * field name when `isMulti` (`images` renders `images[0].id`, ...);
   * pass explicitly for specific-purpose relations (e.g. `coverImageId`
   * for an `images` item).
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
   * Renders the collapsed chip for a saved-but-unsubmitted "new" entry
   * (see `saveNewEntry`). `data` is the entry's fieldset values, already
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
   * entry can be pinned to the front (excluded from drag reordering)
   * via a button, and un-pinned again, rather than position alone
   * carrying that meaning (contrast `images`, where the first entry is
   * always the cover). Submits a `${name}Featured` hidden flag only
   * while an entry is pinned, so a list with no explicit featured choice
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
        existingItems?: (TEmbeddedItem | TPage)[]
      }
  )

type ItemPickerEntry<TEmbeddedItem, TPage> =
  | { kind: 'existing'; item: TEmbeddedItem | TPage }
  | {
      kind: 'new'
      query?: string
      tempId: string
      /** Set once the entry's Save action has validated it — the
       * fieldset stays mounted but collapses into a chip. */
      saved?: boolean
      /**
       * Set once the user edits any field in the entry's fieldset.
       */
      touched?: boolean
      /** Object URL for the entry's picked file, created on Save and
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
       * `new`-entry fieldset/collapse lifecycle (hence the shared
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

/** An entry with a mounted edit fieldset: a new item or an edited existing one. */
type ExpandedEntry<TEmbeddedItem, TPage> = Extract<
  ItemPickerEntry<TEmbeddedItem, TPage>,
  { kind: 'new' | 'editing' }
>

function isEntryExpanded<TEmbeddedItem, TPage>(
  entry: ItemPickerEntry<TEmbeddedItem, TPage>
): entry is ExpandedEntry<TEmbeddedItem, TPage> {
  return entry.kind === 'new' || entry.kind === 'editing'
}

function entryId(entry: ItemPickerEntry<unknown, unknown>): string {
  return entry.kind === 'existing' || entry.kind === 'editing'
    ? (entry.item as { id: string }).id
    : entry.tempId
}

/**
 * A "new" entry's creation order, parsed from its `tempId` (`new-0`,
 * `new-1`, ... as `addNew` mints them). Used to render fieldsets in a
 * fixed order that never changes as chips reorder, so an entry's file
 * input is never remounted.
 */
function newEntrySeq(entry: { tempId: string }): number {
  return Number(entry.tempId.replace('new-', ''))
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
  const listFieldName = name ?? itemType

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

  const startWithBlankEntry =
    mode === 'create' ||
    (!isMulti && isCreateFirst && !hasExistingItems)

  const nextTempId = useRef(startWithBlankEntry ? 1 : 0)
  const [entries, setEntries] = useState<
    ItemPickerEntry<TEmbeddedItem, TPage>[]
  >(() => {
    const existing = isMulti
      ? (props.existingItems ?? []).map((item) => ({
          kind: 'existing' as const,
          item
        }))
      : props.existingItem
        ? [{ kind: 'existing' as const, item: props.existingItem }]
        : []
    if (!startWithBlankEntry) return existing
    const blank = { kind: 'new' as const, tempId: 'new-0' }
    // Keep an initially-featured item pinned at the head. The blank
    // create form joins the rest just after it.
    if (featured?.isInitiallyFeatured && existing.length > 0) {
      return [existing[0], blank, ...existing.slice(1)]
    }
    return [blank, ...existing]
  })
  const [isFeatured, setIsFeatured] = useState(
    featured?.isInitiallyFeatured ?? false
  )
  const [isMainFieldReady, setIsMainFieldReady] = useState(false)
  const [newEntryErrors, setNewEntryErrors] = useState<
    Record<string, FieldErrors>
  >({})
  // Per-draft-entry flag, keyed by tempId: true while the entry's edit form
  // has async work in flight (see `renderEditItemForm`'s `onBusyChange`).
  const [busyEntries, setBusyEntries] = useState<
    Record<string, boolean>
  >({})
  // The existing item the user asked to open for inline editing. A fresh
  // object per request (so re-editing the same id refires) set by a
  // ref-free onClick — keeping `renderEntry` out of the refs lint rule.
  // The ref work (tempId mint + focus) happens in an effect below.
  const [editRequest, setEditRequest] = useState<{
    id: string
  } | null>(null)
  const newEntryFieldsets = useRef(
    new Map<string, HTMLFieldSetElement>()
  )
  // Collapsed-chip DOM nodes, so we can move focus into a chip after
  // its editor collapses via Save (see `pendingChipFocusTempId`).
  const newEntryChips = useRef(new Map<string, HTMLDivElement>())
  // tempId of an entry whose chip should receive focus on the next
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
  // Entry count as of the last commit, so the combobox-refocus effect can
  // detect a single-item picker emptying (1 → 0).
  const prevEntryCount = useRef(entries.length)

  const entriesRef = useRef(entries)
  useEffect(() => {
    entriesRef.current = entries
  }, [entries])
  useEffect(() => {
    return () => {
      entriesRef.current.forEach((entry) => {
        if (isEntryExpanded(entry) && entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl)
        }
      })
    }
  }, [])

  const itemLabel = label || itemTypeToLabel(itemType, true)
  const newLabel = `New ${itemTypeToLabel(itemType, true, true)}`
  const saveLabel = `Save ${itemTypeToLabel(itemType, true, true)}`
  const removeLabel = `Remove ${itemTypeToLabel(itemType, true, true)}`
  const featuredLabel = featured?.label || 'Featured'

  const featuredEntry =
    featured && isFeatured ? entries[0] : undefined
  const restEntries = featuredEntry ? entries.slice(1) : entries
  // Draft entries (new + edited-existing) both carry a mounted fieldset.
  const newRestEntries = restEntries.filter(isEntryExpanded)
  // A saved draft entry's `<input type=file>` can't be repopulated, so
  // its fieldset must never move containers or reorder (either remounts
  // it and drops the file). So the always-mounted draft fieldsets render
  // on their own in a fixed creation order that never changes, while the
  // *chips* — which carry no file input — reorder freely. Since existing
  // entries are likewise fieldset-free, their results and the saved draft
  // chips share ONE sortable list (`sortableEntries`); only open editors
  // (`openNewEntries`) stay fixed, ahead of it.
  const openNewEntries = newRestEntries.filter(
    (entry) => !entry.saved
  )
  const stableNewEntries = [...newRestEntries].sort(
    (a, b) => newEntrySeq(a) - newEntrySeq(b)
  )
  const sortableEntries = restEntries.filter(
    (entry) => entry.kind === 'existing' || entry.saved
  )
  // An entry's submit/action index is its position in the canonical rest
  // order — open editors first, then the sortable chips — offset past
  // any pinned featured entry at the array head.
  const orderedRest = [...openNewEntries, ...sortableEntries]
  const restIndex = (entry: ItemPickerEntry<TEmbeddedItem, TPage>) =>
    orderedRest.indexOf(entry) + (featuredEntry ? 1 : 0)

  function insertEntry(
    current: ItemPickerEntry<TEmbeddedItem, TPage>[],
    entry: ItemPickerEntry<TEmbeddedItem, TPage>
  ) {
    if (!isMulti) return [entry]
    // Keep a pinned featured entry at the front; new picks join the
    // (reorderable) rest right after it instead of displacing it.
    if (featured && isFeatured && current.length > 0) {
      return [current[0], entry, ...current.slice(1)]
    }
    return [entry, ...current]
  }

  function removeEntry(entry: ItemPickerEntry<TEmbeddedItem, TPage>) {
    if (featuredEntry && entryId(featuredEntry) === entryId(entry)) {
      setIsFeatured(false)
    }
    setEntries((current) => {
      const index = current.findIndex(
        (s) => entryId(s) === entryId(entry)
      )
      if (index === -1) return current
      const removed = current[index]
      if (isEntryExpanded(removed)) {
        setNewEntryErrors(({ [removed.tempId]: _, ...rest }) => rest)
        setBusyEntries(({ [removed.tempId]: _, ...rest }) => rest)
        if (removed.previewUrl)
          URL.revokeObjectURL(removed.previewUrl)
      }
      return current.filter((_, i) => i !== index)
    })
  }

  function addExisting(item: TEmbeddedItem | TPage) {
    setEntries((current) => {
      if (
        current.some(
          (s) =>
            (s.kind === 'existing' || s.kind === 'editing') &&
            s.item.id === item.id
        )
      ) {
        return current
      }
      return insertEntry(current, { kind: 'existing', item })
    })
  }

  /**
   * Cancels an in-progress edit of an existing item, restoring its
   * read-only `existing` chip and discarding the edits — the editing
   * counterpart to discarding a `new` draft (which removes it entirely).
   * Ref-free (setState only) so render helpers can reference it; the
   * caller owns any pending-focus ref write.
   */
  function revertEditingEntry(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>
  ) {
    if (entry.kind !== 'editing') return
    if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
    setNewEntryErrors(({ [entry.tempId]: _, ...rest }) => rest)
    setEntries((current) =>
      current.map((s) =>
        entryId(s) === entryId(entry)
          ? { kind: 'existing' as const, item: entry.item }
          : s
      )
    )
  }

  function addNew(query?: string) {
    const tempId = `new-${nextTempId.current++}`
    setEntries((current) =>
      insertEntry(current, { kind: 'new', query, tempId })
    )
    return tempId
  }

  function setNewEntryFieldsetRef(
    tempId: string,
    el: HTMLFieldSetElement | null
  ) {
    if (el) newEntryFieldsets.current.set(tempId, el)
    else newEntryFieldsets.current.delete(tempId)
  }

  function setNewEntryChipRef(
    tempId: string,
    el: HTMLDivElement | null
  ) {
    if (el) newEntryChips.current.set(tempId, el)
    else newEntryChips.current.delete(tempId)
  }

  // Opens an already-attached item for inline editing (requested via
  // `editRequest`): swaps its read-only `existing` entry for an `editing`
  // entry (same item, fresh tempId) that mounts the edit fieldset seeded
  // with the item, then hands off to the create-focus effect. Runs from
  // an effect rather than the onClick so the ref access (tempId mint +
  // focus) stays out of render (see `editRequest`); reuses the shared
  // `new-` tempId sequence so `newEntrySeq` orders the fieldset normally.
  useEffect(() => {
    if (!editRequest) return
    const id = editRequest.id
    const target = entriesRef.current.find(
      (s) => s.kind === 'existing' && entryId(s) === id
    )
    if (!target) return
    const tempId = `new-${nextTempId.current++}`
    // Hide untouched-blank create form when editor opens, only one
    // form is open at once (create mode re-seeds on editor close).
    setEntries((current) =>
      current
        .filter((s) => !(s.kind === 'new' && !s.saved && !s.touched))
        .map((s) =>
          s.kind === 'existing' && entryId(s) === id
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
    const chip = newEntryChips.current.get(tempId)
    if (!chip) return
    const editButton = Array.from(
      chip.querySelectorAll('button')
    ).find((b) => b.textContent?.trim() === 'Edit')
    ;(editButton ?? chip.querySelector('button'))?.focus()
  }, [entries])

  // Focus the first field of a freshly opened create editor so the
  // user lands in the form rather than on <body> after the search
  // input is hidden.
  useEffect(() => {
    const tempId = pendingCreateFocusTempId.current
    if (!tempId) return
    pendingCreateFocusTempId.current = null
    const fieldset = newEntryFieldsets.current.get(tempId)
    fieldset
      ?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea'
      )
      ?.focus()
  }, [entries])

  // Refocus the search input after a multi picker toggles back to
  // search from create mode, so focus isn't dropped on <body>.
  useEffect(() => {
    if (!pendingComboboxFocus.current) return
    pendingComboboxFocus.current = false
    rootRef.current
      ?.querySelector<HTMLElement>('[role="combobox"]')
      ?.focus()
  }, [entries])

  // A single-item picker emptying (1 → 0 entries) means its open create
  // form was abandoned — via the image preview's X (the escape hatch),
  // the Cancel button, or removing the saved chip — which restores the
  // combobox (`showCombobox`). The control that triggered it unmounts
  // with the form, so move focus to the reappearing search input rather
  // than let it drop to <body>. Guarded on the 1 → 0 transition so an
  // initially-empty picker doesn't grab focus on mount.
  useEffect(() => {
    const wasNonEmpty = prevEntryCount.current > 0
    prevEntryCount.current = entries.length
    if (isMulti || !wasNonEmpty || entries.length !== 0) return
    rootRef.current
      ?.querySelector<HTMLElement>('[role="combobox"]')
      ?.focus()
  }, [entries, isMulti])

  function isValidatable(
    el: Element
  ): el is
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement {
    return 'willValidate' in el && 'checkValidity' in el
  }

  /**
   * The prefix a "new" entry's fields are rendered with, provided to the
   * entry's edit form and stripped when reading it back:
   * `${name}[${index}].` for `isMulti`, the single id field's name
   * without its `Id` suffix (`venue.`, `coverImage.`) for a single
   * item — matching how `extractIndexedGroups` and the `resolve*Id`
   * helpers strip the same prefix server-side from the real
   * submission.
   */
  function entryFieldPrefix(submitIndex: number): string {
    if (isMulti)
      return indexedItemFieldPrefix(listFieldName, submitIndex)
    return itemFieldPrefix(singleIdFieldName)
  }

  /**
   * strip `entryFieldPrefix`.
   */
  function collectEntryData(
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
   * Validates a "new" entry, updating `newEntryErrors` with Zod errors.
   * Always valid (a no-op) for item types (e.g. `images`) whose schema
   * needs data not yet available client-side.
   * Moves focus to the first invalid field  when blocking progress (adding
   * another entry). Omitted for the quieter blur-triggered check below,
   * which shouldn't fight the user's own tab navigation.
   */
  function validateNewEntry(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    submitIndex: number,
    options: { focus?: boolean } = {}
  ): boolean {
    if (!isEntryExpanded(entry) || !schema) return true
    const fieldset = newEntryFieldsets.current.get(entry.tempId)
    if (!fieldset) return true

    const prefix = entryFieldPrefix(submitIndex)
    const parsed = schema.safeParse(
      normalizeFormData(collectEntryData(fieldset, prefix))
    )

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten()
        .fieldErrors as FieldErrors
      setNewEntryErrors((current) => ({
        ...current,
        [entry.tempId]: fieldErrors
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

    if (entry.tempId in newEntryErrors) {
      setNewEntryErrors(({ [entry.tempId]: _, ...rest }) => rest)
    }
    return true
  }

  /**
   * Runs native `required`/`type` constraints (the only signal for
   * fields a schema can't see yet, e.g. embed codes' `iframe`
   * textarea, which isn't itself a schema field — only the
   * `host`/`src`/`type` parsed from it are) then `validateNewEntry`,
   * for a single entry — the full validate-and-focus sequence shared by
   * collapsing open entries on another entry (`saveOpenNewEntries`) and an
   * explicit Save.
   */
  function validateEntryStrict(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    submitIndex: number
  ): boolean {
    if (!isEntryExpanded(entry)) return true
    const fieldset = newEntryFieldsets.current.get(entry.tempId)
    if (!fieldset) return true

    const invalid = Array.from(fieldset.elements)
      .filter(isValidatable)
      .find((el) => el.willValidate && !el.checkValidity())

    if (invalid) {
      invalid.reportValidity()
      return false
    }

    return validateNewEntry(entry, submitIndex, { focus: true })
  }

  function findFileInput(
    fieldset: HTMLFieldSetElement
  ): HTMLInputElement | undefined {
    return Array.from(fieldset.elements).find(
      (el): el is HTMLInputElement =>
        el instanceof HTMLInputElement && el.type === 'file'
    )
  }

  // Flag a draft entry as touched the first time the user edits any fields.
  // Returns `current` unchanged once already touched so repeated edits don't
  // re-render. See `Entry`'s `touched` for why untouched entries are pruned.
  function markEntryTouched(tempId: string) {
    setEntries((current) => {
      const target = current.find(
        (s) => isEntryExpanded(s) && s.tempId === tempId
      )
      if (!target || !isEntryExpanded(target) || target.touched) {
        return current
      }
      return current.map((s) =>
        isEntryExpanded(s) && s.tempId === tempId
          ? { ...s, touched: true }
          : s
      )
    })
  }

  /**
   * Validates a single "new" entry and, on success, collapses it into
   * its saved state — the fieldset stays mounted, hidden, and renders
   * a chip in its place. Snapshots the fieldset's values (`summaryData`)
   * and, for any picked file, a `previewUrl`, since the collapsed chip
   * renders from state rather than reading the (now hidden, and
   * ref-only-outside-render) fieldset directly.
   */
  function saveNewEntry(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    submitIndex: number
  ): boolean {
    if (!isEntryExpanded(entry)) return true
    if (!validateEntryStrict(entry, submitIndex)) return false

    const fieldset = newEntryFieldsets.current.get(entry.tempId)
    const prefix = entryFieldPrefix(submitIndex)
    const summaryData = fieldset
      ? normalizeFormData(collectEntryData(fieldset, prefix))
      : {}
    const file = fieldset && findFileInput(fieldset)?.files?.[0]
    const previewUrl = file ? URL.createObjectURL(file) : undefined

    setEntries((current) =>
      current.map((s) =>
        isEntryExpanded(s) && s.tempId === entry.tempId
          ? { ...s, saved: true, previewUrl, summaryData }
          : s
      )
    )
    return true
  }

  /**
   * Re-expands a saved "new" entry for editing, revoking its preview
   * object URL — Save creates a fresh one when the entry is next saved.
   */
  function editNewEntry(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>
  ) {
    if (!isEntryExpanded(entry)) return
    // Only one editor open at a time: drop any *other* still-untouched
    // create editor (the one Save auto-reopens for the next item) as
    // this entry re-expands, so editing doesn't leave a stray file input
    // open beside its edit form. Only `new` strays are disposable —
    // an untouched `editing` entry still owns an item, so it's never
    // pruned. Its `touched` is kept — the entry has content, so toggling
    // back to search should still fold it to a chip.
    const strayIds = new Set(
      entries
        .filter(
          (s) =>
            s.kind === 'new' &&
            !s.saved &&
            !s.touched &&
            s.tempId !== entry.tempId
        )
        .map((s) => (s as { tempId: string }).tempId)
    )
    if (strayIds.size > 0) {
      setNewEntryErrors((current) => {
        const next = { ...current }
        strayIds.forEach((id) => delete next[id])
        return next
      })
    }
    setEntries((current) =>
      current
        .filter((s) => !(s.kind === 'new' && strayIds.has(s.tempId)))
        .map((s) => {
          if (!isEntryExpanded(s) || s.tempId !== entry.tempId)
            return s
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
   * Collapses every still-open "new" entry into its saved chip. Run
   * when the user starts another entry, so completed entries fold up
   * instead of stacking open forms. Blocks (returns false)
   * as soon as an open entry is invalid, with `saveNewEntry`'s validation.
   */
  function saveOpenNewEntries(): boolean {
    for (const entry of entries) {
      if (!isEntryExpanded(entry) || entry.saved) continue
      if (!saveNewEntry(entry, restIndex(entry))) return false
    }
    return true
  }

  /**
   * Whether a "new" entry passes native + schema validation *without*
   * reporting or focusing — used to decide collapse-vs-discard when the
   * user toggles back to search (a mode switch shouldn't nag with
   * validation bubbles the way an explicit Save does).
   */
  function isEntryComplete(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>
  ): boolean {
    if (!isEntryExpanded(entry)) return true
    const fieldset = newEntryFieldsets.current.get(entry.tempId)
    if (!fieldset) return false
    const nativeValid = Array.from(fieldset.elements)
      .filter(isValidatable)
      .every((el) => !el.willValidate || el.checkValidity())
    if (!nativeValid) return false
    return validateNewEntry(entry, restIndex(entry))
  }

  /**
   * Toggle back to search from create mode: collapse a complete draft
   * into its chip, or discard an empty/incomplete one — either way the
   * open editor closes, so `showCombobox`/`hasOpenDraft` fall back to the
   * search input. Only one editor is ever open at a time (adding
   * another runs `saveOpenNewEntries` first), so the head entry suffices.
   *
   * An untouched editor (Save reopens one for the next item) is
   * discarded, not saved: for schemaless items like images its empty
   * form passes validation, so `isEntryComplete` alone would fold it into
   * a phantom chip.
   *
   * Sets the matching pending-focus ref for whichever happens: a
   * discarded entry leaves the search input as the thing to focus, but a
   * collapsed one replaces the editor with a chip (and, for a
   * single-item picker, can hide the combobox entirely — see
   * `showCombobox`) — so focus must follow to the chip's Edit control
   * instead, the same as the explicit Save button does.
   */
  function returnToSearch() {
    const open = openNewEntries[0]
    if (!open) return
    // An open edit of an existing item reverts to its chip rather than
    // being discarded — discarding would drop the attached item.
    if (open.kind === 'editing') {
      revertEditingEntry(open)
      pendingComboboxFocus.current = true
      return
    }
    if (open.touched && isEntryComplete(open)) {
      if (saveNewEntry(open, restIndex(open))) {
        pendingChipFocusTempId.current = open.tempId
      }
    } else {
      removeEntry(open)
      pendingComboboxFocus.current = true
    }
  }

  function setFeatured(entry: ItemPickerEntry<TEmbeddedItem, TPage>) {
    setEntries((current) => {
      const index = current.findIndex(
        (s) => entryId(s) === entryId(entry)
      )
      if (index === -1) return current
      const target = current[index]
      return [target, ...current.filter((_, i) => i !== index)]
    })
    setIsFeatured(true)
  }

  function featuredControl(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
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
        onClick={() => setFeatured(entry)}
      >
        <StarIcon />
      </button>
    )
  }

  /** The collapsed chip for a saved draft (new or edited-existing) entry. */
  function renderNewItemChip(
    entry: ExpandedEntry<TEmbeddedItem, TPage>,
    dragHandle?: React.ReactNode
  ) {
    const actions = {
      onEdit: () => editNewEntry(entry),
      onRemove: () => removeEntry(entry)
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
        ref={(el) => setNewEntryChipRef(entry.tempId, el)}
      >
        {dragHandle}
        <div className={selectedResultStyles['content']}>
          {entry.kind === 'editing' ? (
            // An edited existing item collapses back to its normal result
            // chip (merged with the edits), plus an Edit control to reopen.
            renderExistingResult(
              { ...entry.item, ...entry.summaryData } as
                | TEmbeddedItem
                | TPage,
              actions.onRemove,
              removeLabel,
              editButton
            )
          ) : renderNewItemSummary ? (
            renderNewItemSummary(
              entry.summaryData ?? {},
              entry.previewUrl,
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
   * The "new" entry's edit fieldset — kept mounted (never unmounted or
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
   * called directly from `renderEntry`, matching `renderEntry` itself —
   * assigning this fieldset's output (it carries a `ref` callback) to a
   * variable instead of returning it directly trips the
   * `react-hooks/refs` lint rule's ref-reachability analysis.
   */
  function renderNewFieldset(
    entry: ExpandedEntry<TEmbeddedItem, TPage>,
    submitIndex: number
  ) {
    const idInputName = isMulti
      ? `${indexedItemFieldPrefix(listFieldName, submitIndex)}id`
      : singleIdFieldName
    return (
      <fieldset
        hidden={entry.saved}
        className={itemPickerStyles['new-item-fieldset']}
        ref={(el) => setNewEntryFieldsetRef(entry.tempId, el)}
        onChange={() => markEntryTouched(entry.tempId)}
        // Multi-item entries are already validated when the user tries
        // to add another one (`saveOpenNewEntries`). Single-item
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
                validateNewEntry(entry, submitIndex)
              }
        }
      >
        <legend className='visually-hidden'>
          {entry.kind === 'editing' ? itemLabel : newLabel}
        </legend>
        {/* An edited existing item submits its id alongside the edited
            fields, so the server UPDATEs it (an `edited` entry) rather
            than creating a duplicate. */}
        {entry.kind === 'editing' && idInputName && (
          <input
            type='hidden'
            name={idInputName}
            value={entry.item.id}
            readOnly
          />
        )}
        <NamePrefixProvider prefix={entryFieldPrefix(submitIndex)}>
          {renderEditItemForm?.({
            query: entry.kind === 'new' ? entry.query : undefined,
            errors: newEntryErrors[entry.tempId],
            isRequired: isRequired ?? false,
            // Single-item pickers replace their combobox with this form,
            // so removing the entry returns to search — wire that as the
            // create form's own cancel (e.g. the image preview's X). Multi
            // keeps its always-present combobox, so its Cancel button
            // suffices and no create-form cancel is passed.
            onCancel: isMulti ? undefined : () => removeEntry(entry),
            onReadyChange: isMulti ? undefined : setIsMainFieldReady,
            existingItem:
              entry.kind === 'editing' ? entry.item : undefined,
            onBusyChange: (isBusy: boolean) =>
              setBusyEntries((current) =>
                current[entry.tempId] === isBusy
                  ? current
                  : { ...current, [entry.tempId]: isBusy }
              )
          })}
        </NamePrefixProvider>
        <div
          className={`${itemPickerStyles['create-form-actions']} ${
            isSearchFirst || entry.kind === 'editing'
              ? itemPickerStyles['create-form-actions-visible']
              : ''
          }`}
        >
          <button
            type='button'
            className={`button-primary ${itemPickerStyles['save-button']}`}
            disabled={busyEntries[entry.tempId]}
            onClick={() => {
              if (!saveNewEntry(entry, submitIndex)) return
              // After saving a *new* item, reopen an empty editor for the
              // next one. A saved edit collapses to its chip.
              if (isMulti && entry.kind === 'new') {
                pendingCreateFocusTempId.current = addNew()
              } else if (
                isMulti &&
                entry.kind === 'editing' &&
                mode === 'create'
              ) {
                pendingCreateFocusTempId.current = addNew()
              } else {
                pendingChipFocusTempId.current = entry.tempId
              }
            }}
          >
            {saveLabel}
          </button>
          {entry.kind === 'editing' && (
            <button
              type='button'
              className='button-sm'
              onClick={() => {
                revertEditingEntry(entry)
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

  function renderEntry(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    index: number,
    dragHandle?: React.ReactNode,
    featuredButton?: React.ReactNode
  ) {
    return entry.kind === 'existing' ? (
      (() => {
        const Wrapper: 'div' | 'fieldset' = isMulti
          ? 'div'
          : 'fieldset'

        const editButton = !!renderEditItemForm ? (
          <button
            type='button'
            className='button-sm'
            onClick={() => setEditRequest({ id: entry.item.id })}
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
                  ? `${indexedItemFieldPrefix(listFieldName, index)}id`
                  : singleIdFieldName
              }
              id={entry.item.id}
              dragHandle={dragHandle}
            >
              {renderExistingResult(
                entry.item,
                () => removeEntry(entry),
                removeLabel,
                extraActions
              )}
            </SelectedResult>
          </Wrapper>
        )
      })()
    ) : isMulti ? (
      <>
        {entry.saved && renderNewItemChip(entry, dragHandle)}
        {renderNewFieldset(entry, index)}
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
        {entry.saved && renderNewItemChip(entry)}
        {renderNewFieldset(entry, index)}
      </div>
    )
  }

  /**
   * One reorderable chip in the shared sortable list: an existing item's
   * result, or a saved-new entry's collapsed chip (its fieldset lives in
   * the fixed list, so only the chip is rendered here).
   */
  function renderSortableRow(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    dragHandle?: React.ReactNode
  ) {
    const index = restIndex(entry)
    return entry.kind === 'existing'
      ? renderEntry(
          entry,
          index,
          dragHandle,
          featuredControl(entry, false)
        )
      : renderNewItemChip(entry, dragHandle)
  }

  // While a draft editor is open  the combobox stays mounted but
  // hides its search input, swapping the "New {item}" button for a
  // "Search {item}" toggle. Search and create are never shown at once.
  const hasOpenDraft = entries.some(
    (entry) => isEntryExpanded(entry) && !entry.saved
  )
  // Multi always shows the combobox, single shows it only to search
  // (empty list) or while a draft is open (the toggle carries label + Search).
  const showCombobox = isMulti || entries.length === 0 || hasOpenDraft

  return (
    <div
      className={`${itemPickerStyles['item-picker']} ${
        !isMulti ? itemPickerStyles['item-picker-single'] : ''
      }`}
      ref={rootRef}
    >
      {isMulti && (
        <input
          name={emptyListFieldName(listFieldName)}
          type='hidden'
          value=''
          readOnly
        />
      )}

      {isMulti && featuredEntry && (
        <input
          name={featuredFlagFieldName(listFieldName)}
          type='hidden'
          value='true'
          readOnly
        />
      )}

      {showCombobox && (
        <Combobox<TEmbeddedItem, TPage, S>
          label={label || itemTypeToLabel(itemType, !isMulti)}
          description={description}
          isRequired={isRequired}
          initialResults={initialResults}
          searchParams={searchParams}
          itemType={itemType}
          isCreating={hasOpenDraft}
          // Hidden if single-picker & open entry's main field is valid,
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
                  // Collapse open entry(s) before adding another.
                  if (!saveOpenNewEntries()) return
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

      {/*
       * New entries' always-mounted fieldsets render on their own, in a
       * fixed creation order that never reorders — reordering (or moving
       * containers) would remount them and drop their picked file. Open
       * editors show here and aren't draggable; the collapsed chips
       * (below) carry no file input, so they reorder freely.
       */}
      {isMulti &&
        newRestEntries.length > 0 &&
        stableNewEntries.map((entry) => (
          <div
            key={entryId(entry)}
            className={itemPickerStyles['item-picker-multi-slot']}
          >
            {renderNewFieldset(entry, restIndex(entry))}
          </div>
        ))}

      {featuredEntry && (
        <div className={itemPickerStyles['featured-slot']}>
          {renderEntry(
            featuredEntry,
            0,
            undefined,
            featuredControl(featuredEntry, true)
          )}
        </div>
      )}

      {/*
       * One sortable list for every chip — existing-item results and
       * collapsed saved-new entries together — so they reorder relative to
       * one another. Drag controls appear only with more than one chip.
       */}
      {isMulti ? (
        sortableEntries.length > 1 ? (
          <SortableList
            className={itemPickerStyles['item-list']}
            items={sortableEntries.map((entry) => ({
              id: entryId(entry),
              entry
            }))}
            onReorder={(reordered) =>
              setEntries([
                ...(featuredEntry ? [featuredEntry] : []),
                ...openNewEntries,
                ...reordered.map((entry) => entry.entry)
              ])
            }
            renderItem={(entry, _index, dragHandle) =>
              renderSortableRow(entry.entry, dragHandle)
            }
          />
        ) : (
          sortableEntries.length === 1 && (
            <div className={itemPickerStyles['item-list']}>
              {renderSortableRow(sortableEntries[0])}
            </div>
          )
        )
      ) : (
        restEntries.length > 0 && (
          <>
            {restEntries.map((entry, index) => (
              <div
                className={
                  itemPickerStyles['item-picker-single-slot']
                }
                key={entryId(entry)}
              >
                {renderEntry(
                  entry,
                  index,
                  undefined,
                  featuredControl(entry, false)
                )}
              </div>
            ))}
          </>
        )
      )}
    </div>
  )
}
