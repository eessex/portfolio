'use client'

import { BarsArrowDownIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { flushSync } from 'react-dom'
import type { z } from 'zod'

import {
  emptyListFieldName,
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
import { CreateItemButton } from '@/ui/buttons/create-item-button'
import { Combobox } from '@/ui/combobox/combobox'
import { SortableList } from '@/ui/drag-and-drop/sortable-list'
import { InputLabel } from '@/ui/form/input-label'
import { DraftChip } from '@/ui/item-picker/draft-chip'
import {
  DraftFieldset,
  useMarkEntryTouched
} from '@/ui/item-picker/draft-fieldset'
import { ExistingEntryRow } from '@/ui/item-picker/existing-entry-row'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import {
  type Draft,
  entryId,
  type ItemPickerEntry
} from '@/ui/item-picker/item-picker-entry'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'
import {
  type FieldErrors,
  useEntryValidation
} from '@/ui/item-picker/use-entry-validation'
import { useItemPickerEntries } from '@/ui/item-picker/use-item-picker-entries'
import type { ResultsResponse } from '@/ui/use-results-list'
import type { SearchParams } from '@/ui/util'

/** Named args passed to a picker's `renderEditItemForm` callback. */
export type RenderEditItemFormArgs<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
> = {
  /** search query, for seeding a value into a create form. */
  query?: string
  errors?: FieldErrors
  isRequired?: boolean
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
  /**
   * New drafts only: swaps the draft for an already-saved item (e.g.
   * one with the URL just typed), so it isn't created twice.
   */
  onExistingMatch?: (item: TEmbeddedItem | TPage) => void
}

/** Actions passed to a picker's `renderNewItemSummary` callback. */
export type NewItemSummaryActions = {
  editButton: React.ReactNode
  onRemove: () => void
  removeLabel: string
}

type FocusTarget =
  | { kind: 'edit'; id: string }
  | { kind: 'create'; tempId: string }
  | { kind: 'combobox' }

type ItemPickerSharedProps<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient,
  S extends PageDataResponse | undefined
> = {
  /** Server-seeded first page. Omit to fetch on mount. */
  initialResults?: ResultsResponse<TEmbeddedItem, TPage, S>
  label?: string
  description?: string
  /** The search input's placeholder (default `searchLabel`). */
  placeholder?: string
  /** The "Search {items}" toggle's text (default "Search {items}"). */
  searchLabel?: string
  /**
   * The item's singular name in New/Save/Remove text (default the item
   * type's, e.g. "link"); distinguishes two pickers of one item type.
   */
  itemName?: string
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
   * `SelectedResult` chip. `extraActions` (e.g. the Edit button)
   * is passed through only for the latter, rendered next to `onRemove`
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
   * Open on the search input rather than a blank create form. Suits
   * types whose first field is free text the search box can capture
   * directly (`venue.name`, `publisher.name`), unlike a URL/iframe/file.
   */
  isSearchFirst?: boolean
  /**
   * With `isSearchFirst`: a "Create “{query}”" result creates the item
   * from the typed query alone, collapsing it straight to its chip
   * (`publisher.name`). The edit form must seed its main field from
   * `query`.
   */
  isCreatedFromQuery?: boolean
  /** Whether a selected item offers Edit (default: all do). */
  isItemEditable?: (item: TEmbeddedItem | TPage) => boolean
  /**
   * currently only omitted in tests
   */
  schema?: z.ZodTypeAny
  /**
   * Renders the collapsed chip for a saved-but-unsubmitted "new" entry
   * (see `saveDraft`). `data` is the entry's fieldset values, already
   * collected + `normalizeFormData`-normalized the same way `schema`
   * validation reads them. Use this for item types whose `renderExistingResult`
   * can't render an unsaved item (e.g. `images`, which needs an s3 `url`).
   * `editButton` is the picker's own (so it can move focus to it after
   * Save); render it as-is. `removeLabel` matches `renderExistingResult`'s.
   */
  renderNewItemSummary?: (
    data: Record<string, unknown>,
    previewUrl: string | undefined,
    actions: NewItemSummaryActions
  ) => React.ReactNode
}

export type ItemPickerProps<
  TEmbeddedItem extends EmbeddedItem = never,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
> = ItemPickerSharedProps<TEmbeddedItem, TPage, S> &
  (
    | {
        isMulti?: false
        existingItem?: TEmbeddedItem | TPage
        /** Called when the selected item changes (not on mount). */
        onSelectionChange?: (item?: TEmbeddedItem | TPage) => void
      }
    | {
        isMulti: true
        existingItems?: (TEmbeddedItem | TPage)[]
        /**
         * Create-only: no search, just an Add button, for child items
         * no other form can share (a release's published editions).
         */
        isSearchHidden?: boolean
        /**
         * With `isSearchHidden`: no New button once this many are
         * listed. Above 1, an "N of max" hint shows the count.
         */
        maxItems?: number
        /**
         * With `isSearchHidden`: a blank create form stays open in place
         * of the New button, until `maxItems` are listed.
         */
        isCreateFormAlwaysOpen?: boolean
        /**
         * Chips are always sorted by this, with no drag controls (a
         * release's editions, by date). Use instead of `defaultOrder`.
         */
        sortBy?: (
          a: Record<string, unknown>,
          b: Record<string, unknown>
        ) => number
        /**
         * Chips stay sorted by `compare` until dragged out of order;
         * then new chips join the top and a `resetLabel` button
         * restores the default. `group` ranks are enforced even in a
         * custom order (lower first).
         */
        defaultOrder?: {
          compare: (
            a: Record<string, unknown>,
            b: Record<string, unknown>
          ) => number
          group?: (item: Record<string, unknown>) => number
          resetLabel: string
        }
      }
  )

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
    placeholder,
    searchLabel,
    itemName = itemTypeToLabel(props.itemType, true, true),
    name,
    renderExistingResult,
    renderEditItemForm,
    isMulti,
    schema,
    renderNewItemSummary,
    isSearchFirst: isSearchFirstProp,
    isCreatedFromQuery,
    isItemEditable
  } = props

  const defaultOrder = props.isMulti ? props.defaultOrder : undefined
  const sortBy = props.isMulti ? props.sortBy : undefined
  const compareOrder = sortBy ?? defaultOrder?.compare
  const isSearchHidden =
    !!props.isMulti && !!renderEditItemForm && !!props.isSearchHidden
  const maxItems = props.isMulti ? props.maxItems : undefined
  const isCreateFormAlwaysOpen =
    isSearchHidden &&
    !!props.isMulti &&
    !!props.isCreateFormAlwaysOpen
  // non-empty when nested in another picker's entry
  const outerPrefix = useNamePrefix()
  const singleIdFieldName = `${outerPrefix}${itemIdFieldName(itemType, name)}`
  const listFieldName = `${outerPrefix}${name ?? itemType}`

  const isSearchFirst = !!renderEditItemForm && !!isSearchFirstProp
  const isCreateFirst = !!renderEditItemForm && !isSearchFirst
  const existingItems = isMulti
    ? (props.existingItems ?? [])
    : props.existingItem
      ? [props.existingItem]
      : []

  // Create vs search for a multi picker's next entry; single pickers
  // don't use it (see `setMultiMode`).
  const [mode, setMode] = useState<'create' | 'search'>(
    isMulti && isCreateFirst ? 'create' : 'search'
  )
  const setMultiMode = (next: 'create' | 'search') => {
    if (isMulti) setMode(next)
  }
  const [isMainFieldReady, setIsMainFieldReady] = useState(false)
  const {
    draftErrors,
    clearErrors,
    validateDraft,
    validateEntryStrict,
    readEntryValues,
    hasEntryContent,
    setFieldsetRef,
    getFieldset
  } = useEntryValidation({ schema, fieldPrefix: entryFieldPrefix })
  const {
    entries,
    busyEntries,
    openDraft,
    stableDrafts,
    sortableEntries,
    entryIndex,
    hasOpenDraft,
    addExisting,
    addNew,
    editExisting,
    removeEntry,
    replaceDraftWithExisting,
    revertEditingEntry,
    markEntryTouched,
    setBusyEntry,
    saveDraft,
    editDraft,
    closeDraft,
    closeOpenDrafts,
    reorderSortable,
    isReorderable,
    isSameGroup,
    isCustomOrder,
    resetToDefaultOrder
  } = useItemPickerEntries<TEmbeddedItem, TPage>({
    isMulti: !!isMulti,
    existingItems,
    // create-only lists open a blank editor only when empty, unless
    // it's always open
    isCreateFirst:
      isCreateFirst &&
      (!isSearchHidden ||
        existingItems.length === 0 ||
        (isCreateFormAlwaysOpen &&
          existingItems.length < (maxItems ?? Infinity))),
    compareDefaultOrder: compareOrder,
    isOrderFixed: !!sortBy,
    orderGroup: defaultOrder?.group,
    isBlankDraftDiscarded: isCreateFormAlwaysOpen,
    validation: {
      validateEntryStrict,
      clearErrors,
      readEntryValues,
      hasEntryContent
    }
  })
  // Where to move focus once the next `entries` change commits — the
  // control that triggered it (Save, Cancel, the search toggle) is
  // usually unmounted or hidden by that change.
  const pendingFocus = useRef<FocusTarget | null>(null)
  // Edit buttons by `entryId`: a saved chip's (after Save) or an
  // existing row's (after Cancel).
  const editButtons = useRef(new Map<string, HTMLButtonElement>())
  // The picker's root, so the combobox can refocus.
  const rootRef = useRef<HTMLDivElement>(null)
  // A create-from-query draft to save once its fieldset has mounted.
  const autoSaveId = useRef<string | null>(null)
  // Entry count as of the last commit, so the focus effect can detect a
  // single-item picker emptying (1 → 0).
  const prevEntryCount = useRef(entries.length)

  const itemLabel = label || itemTypeToLabel(itemType, true)
  const newLabel = `New ${itemName}`
  const saveLabel = `Save ${itemName}`
  const removeLabel = `Remove ${itemName}`

  function setEditButtonRef(
    id: string,
    el: HTMLButtonElement | null
  ) {
    if (el) editButtons.current.set(id, el)
    else editButtons.current.delete(id)
  }

  // Resolve `pendingFocus` after the change that requested it commits,
  // so keyboard/screen-reader users aren't dropped on <body>. With
  // nothing pending, a single-item picker emptying (1 → 0) means its
  // open form was abandoned or its chip removed — the control that did
  // it unmounted, so fall back to the reappearing search input. Guarded
  // on the transition so an initially-empty picker doesn't grab focus
  // on mount.
  useEffect(() => {
    const wasNonEmpty = prevEntryCount.current > 0
    prevEntryCount.current = entries.length
    const target = pendingFocus.current
    pendingFocus.current = null

    if (target?.kind === 'edit') {
      editButtons.current.get(target.id)?.focus()
    } else if (target?.kind === 'create') {
      getFieldset(target.tempId)
        ?.querySelector<HTMLElement>(
          'input:not([type="hidden"]), select, textarea'
        )
        ?.focus()
    } else if (
      target?.kind === 'combobox' ||
      (!isMulti && wasNonEmpty && entries.length === 0)
    ) {
      rootRef.current
        ?.querySelector<HTMLElement>('[role="combobox"]')
        ?.focus()
    }
  }, [entries, getFieldset, isMulti])

  // the id input is hidden, so the browser can't validate it: flag the
  // search box instead, so Save stops and focuses here like a native field
  const isMissingRequired =
    !isMulti && !!isRequired && !entries.length
  useEffect(() => {
    // a multi picker's query could hit a nested picker's combobox
    if (isMulti) return
    rootRef.current
      ?.querySelector<HTMLInputElement>('[role="combobox"]')
      ?.setCustomValidity(
        isMissingRequired ? `Select a ${itemName}.` : ''
      )
  }, [isMulti, isMissingRequired, itemName])

  const selectedItem =
    !isMulti && entries[0] && entries[0].kind !== 'new'
      ? entries[0].item
      : undefined
  const onSelectionChange = useEffectEvent(
    (item?: TEmbeddedItem | TPage) => {
      if (!props.isMulti) props.onSelectionChange?.(item)
    }
  )
  const prevSelectedId = useRef(selectedItem?.id)
  useEffect(() => {
    if (selectedItem?.id === prevSelectedId.current) return
    prevSelectedId.current = selectedItem?.id
    onSelectionChange(selectedItem)
  }, [selectedItem])

  // nested in another picker's entry: any change here edits that entry
  const markOuterEntryTouched = useMarkEntryTouched()
  const onEntriesChange = useEffectEvent(() =>
    markOuterEntryTouched?.()
  )
  const prevEntries = useRef(entries)
  useEffect(() => {
    if (entries === prevEntries.current) return
    prevEntries.current = entries
    onEntriesChange()
  }, [entries])

  // an open draft counts only once it's been saved (a reopened chip)
  const itemCount =
    openDraft?.kind === 'new' && !openDraft.summaryData
      ? entries.length - 1
      : entries.length
  const isBelowMax = itemCount < (maxItems ?? Infinity)
  // "1 of 1" says nothing
  const isMaxHintShown = maxItems !== undefined && maxItems > 1
  // reopen the blank form whenever the last editor closes (save,
  // cancel, an existing match, a remove below the cap); before paint,
  // so the gap between closing and reopening never shows
  const openBlankForm = useEffectEvent(() => addNew())
  useLayoutEffect(() => {
    if (isCreateFormAlwaysOpen && !hasOpenDraft && isBelowMax) {
      openBlankForm()
    }
  }, [isCreateFormAlwaysOpen, hasOpenDraft, isBelowMax])

  // saveDraft reads the fieldset, so it waits for the draft's commit
  useEffect(() => {
    const tempId = autoSaveId.current
    if (!tempId) return
    const entry = entries.find(
      (s): s is Draft<TEmbeddedItem, TPage> =>
        s.kind !== 'existing' && s.tempId === tempId
    )
    if (!entry) return
    autoSaveId.current = null
    if (saveDraft(entry, entryIndex(entry))) {
      pendingFocus.current = { kind: 'edit', id: entryId(entry) }
    } else {
      // invalid: leave the editor open on its first field
      getFieldset(tempId)
        ?.querySelector<HTMLElement>(
          'input:not([type="hidden"]), select, textarea'
        )
        ?.focus()
    }
  }, [entries, entryIndex, getFieldset, saveDraft])

  // save the open editor before parent submit so it's sorted;
  // block if invalid, skip if busy
  const onParentSubmit = useEffectEvent((event: SubmitEvent) => {
    if (!compareOrder || !openDraft) return
    if (busyEntries[openDraft.tempId]) return
    let closed: ReturnType<typeof closeDraft>
    flushSync(() => {
      closed = closeDraft(openDraft)
    })
    if (!closed) {
      event.preventDefault()
      event.stopPropagation()
    }
  })

  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return
    // capture phase: runs before React's delegated onSubmit
    const listener = (event: SubmitEvent) => onParentSubmit(event)
    form.addEventListener('submit', listener, true)
    return () => form.removeEventListener('submit', listener, true)
  }, [])

  /**
   * The prefix a draft's fields are rendered with, provided to the
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
   * Toggle back to search, closing the open editor via `closeDraft`
   * (validated; only an untouched empty new draft is dropped unchecked). Returns
   * `false` if it stays open, invalid.
   *
   * Focus follows whichever happens: the search input after a
   * discard, or the saved chip's Edit button (a single picker's
   * combobox hides once it has an entry — see `showCombobox`).
   */
  function returnToSearch(): boolean {
    if (!openDraft) return true
    const closed = closeDraft(openDraft)
    if (!closed) return false
    pendingFocus.current =
      closed === 'saved'
        ? { kind: 'edit', id: entryId(openDraft) }
        : { kind: 'combobox' }
    return true
  }

  function renderDraftChip(
    entry: Draft<TEmbeddedItem, TPage>,
    dragHandle?: React.ReactNode
  ) {
    return (
      <DraftChip
        entry={entry}
        dragHandle={dragHandle}
        onEdit={() => editDraft(entry)}
        onRemove={() => removeEntry(entry)}
        renderExistingResult={renderExistingResult}
        renderNewItemSummary={renderNewItemSummary}
        newLabel={newLabel}
        removeLabel={removeLabel}
        setEditButtonRef={(el) =>
          setEditButtonRef(entryId(entry), el)
        }
      />
    )
  }

  function handleSave(
    entry: Draft<TEmbeddedItem, TPage>,
    submitIndex: number
  ) {
    if (!saveDraft(entry, submitIndex)) return
    // Multi: reopen an empty editor for the next item after a new one,
    // or after an edit in create mode. Otherwise (and always when
    // create-only) the saved entry collapses to its chip.
    if (
      isMulti &&
      !isSearchHidden &&
      (entry.kind === 'new' || mode === 'create')
    ) {
      pendingFocus.current = { kind: 'create', tempId: addNew() }
    } else {
      pendingFocus.current = { kind: 'edit', id: entryId(entry) }
    }
  }

  function handleCancelEdit(
    entry: Extract<
      ItemPickerEntry<TEmbeddedItem, TPage>,
      { kind: 'editing' }
    >
  ) {
    revertEditingEntry(entry)
    if (!isMulti || isSearchHidden) {
      // The reverted row replaces the editor; focus its Edit button.
      pendingFocus.current = { kind: 'edit', id: entry.item.id }
    } else if (mode === 'create') {
      pendingFocus.current = { kind: 'create', tempId: addNew() }
    } else {
      pendingFocus.current = { kind: 'combobox' }
    }
  }

  function handleExistingMatch(
    entry: Draft<TEmbeddedItem, TPage>,
    item: TEmbeddedItem | TPage
  ) {
    replaceDraftWithExisting(entry, item)
    // the draft's form unmounts without reporting
    setIsMainFieldReady(false)
    pendingFocus.current = { kind: 'edit', id: item.id }
  }

  function handleAddNew() {
    if (!closeOpenDrafts()) return
    pendingFocus.current = { kind: 'create', tempId: addNew() }
  }

  function renderDraftFieldset(
    entry: Draft<TEmbeddedItem, TPage>,
    submitIndex: number
  ) {
    return (
      <DraftFieldset
        entry={entry}
        idInputName={
          isMulti
            ? `${indexedItemFieldPrefix(listFieldName, submitIndex)}id`
            : singleIdFieldName
        }
        fieldPrefix={entryFieldPrefix(submitIndex)}
        errors={draftErrors[entry.tempId]}
        isBusy={busyEntries[entry.tempId]}
        isRequired={isRequired ?? false}
        // an always-open form shows Save once expanded, like LinksPicker
        isActionsVisible={
          isSearchFirst || (isSearchHidden && !isCreateFormAlwaysOpen)
        }
        legend={entry.kind === 'editing' ? itemLabel : newLabel}
        saveLabel={saveLabel}
        onSave={() => handleSave(entry, submitIndex)}
        // a new draft has no saved version to go back to
        onCancel={
          entry.kind === 'editing'
            ? () => handleCancelEdit(entry)
            : undefined
        }
        onTouched={() => markEntryTouched(entry.tempId)}
        // Multi-item entries are already validated when the user tries
        // to open another one (`closeOpenDrafts`). Single-item
        // pickers validate on blur when focus leaves the fieldset.
        onBlurValidate={
          isMulti
            ? undefined
            : () => validateDraft(entry.tempId, submitIndex)
        }
        onReadyChange={isMulti ? undefined : setIsMainFieldReady}
        onBusyChange={(isBusy) => setBusyEntry(entry.tempId, isBusy)}
        onExistingMatch={(item) => handleExistingMatch(entry, item)}
        setFieldsetRef={(el) => setFieldsetRef(entry.tempId, el)}
        renderEditItemForm={renderEditItemForm}
      />
    )
  }

  function handleEditExisting(id: string) {
    const tempId = editExisting(id)
    if (tempId) pendingFocus.current = { kind: 'create', tempId }
  }

  function renderExistingEntry(
    entry: Extract<
      ItemPickerEntry<TEmbeddedItem, TPage>,
      { kind: 'existing' }
    >,
    index: number,
    dragHandle?: React.ReactNode
  ) {
    return (
      <ExistingEntryRow<TEmbeddedItem, TPage>
        entry={entry}
        itemType={itemType}
        idInputName={
          isMulti
            ? `${indexedItemFieldPrefix(listFieldName, index)}id`
            : singleIdFieldName
        }
        dragHandle={dragHandle}
        legend={
          isMulti ? undefined : (
            <InputLabel
              as='legend'
              isRequired={isRequired}
              label={itemLabel}
              description={description}
            />
          )
        }
        onEdit={
          renderEditItemForm && (isItemEditable?.(entry.item) ?? true)
            ? () => handleEditExisting(entry.item.id)
            : undefined
        }
        onRemove={() => removeEntry(entry)}
        removeLabel={removeLabel}
        setEditButtonRef={(el) => setEditButtonRef(entry.item.id, el)}
        renderExistingResult={renderExistingResult}
      />
    )
  }

  function renderEntry(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    index: number,
    dragHandle?: React.ReactNode
  ) {
    return entry.kind === 'existing' ? (
      renderExistingEntry(entry, index, dragHandle)
    ) : isMulti ? (
      <>
        {entry.isSaved && renderDraftChip(entry, dragHandle)}
        {renderDraftFieldset(entry, index)}
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
        {entry.isSaved && renderDraftChip(entry)}
        {renderDraftFieldset(entry, index)}
      </div>
    )
  }

  /**
   * One reorderable chip in the shared sortable list: an existing item's
   * result, or a saved draft's collapsed chip (its fieldset lives in
   * the fixed list, so only the chip is rendered here).
   */
  function renderSortableRow(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    dragHandle?: React.ReactNode
  ) {
    return entry.kind === 'existing'
      ? renderEntry(entry, entryIndex(entry), dragHandle)
      : renderDraftChip(entry, dragHandle)
  }

  // Multi always shows the combobox, single shows it only to search
  // (empty list) or while a draft is open (the toggle carries label + Search).
  const showCombobox = isMulti || entries.length === 0 || hasOpenDraft

  return (
    <div
      className={clsx(
        itemPickerStyles['item-picker'],
        !isMulti && itemPickerStyles['item-picker-single'],
        isSearchHidden && itemPickerStyles['item-picker-create-only']
      )}
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
      {/* an absent id keeps the stored relation on update; '' clears it */}
      {!isMulti &&
        entries[0]?.kind !== 'existing' &&
        entries[0]?.kind !== 'editing' && (
          <input
            name={singleIdFieldName}
            type='hidden'
            value=''
            readOnly
          />
        )}

      {isSearchHidden ? (
        <div className={itemPickerStyles['create-only-header']}>
          <InputLabel
            isRequired={isRequired}
            label={label || itemTypeToLabel(itemType, false)}
            // with a cap, the description shares a row with its hint
            description={isMaxHintShown ? undefined : description}
          />
          {!isCreateFormAlwaysOpen && !hasOpenDraft && isBelowMax && (
            <CreateItemButton
              className='button-sm'
              itemType={itemType}
              label={newLabel}
              onClick={handleAddNew}
            />
          )}
          {isMaxHintShown && (
            <div className={itemPickerStyles['description-row']}>
              {description && <p>{description}</p>}
              {/* always mounted, so the live region announces the cap */}
              <span
                className={itemPickerStyles['max-items-hint']}
                role='status'
              >
                {itemCount > 0 && (
                  <>
                    {itemCount} of {maxItems}
                    {!isBelowMax && (
                      <span className='visually-hidden'>
                        , the most allowed
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      ) : (
        showCombobox && (
          <Combobox<TEmbeddedItem, TPage, S>
            label={label || itemTypeToLabel(itemType, !isMulti)}
            description={description}
            placeholder={placeholder}
            searchLabel={searchLabel}
            newLabel={newLabel}
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
                    if (returnToSearch()) setMultiMode('search')
                  }
            }
            renderExistingResult={renderExistingResult}
            createOptionLabel={
              isCreatedFromQuery && isSearchFirst
                ? (q) => `Create “${q}”`
                : undefined
            }
            onCreateNew={
              renderEditItemForm
                ? (q) => {
                    // Collapse open drafts before adding another.
                    if (!closeOpenDrafts()) return
                    setMultiMode('create')
                    const tempId = addNew(q || undefined)
                    if (isCreatedFromQuery && q) {
                      autoSaveId.current = tempId
                    } else {
                      pendingFocus.current = {
                        kind: 'create',
                        tempId
                      }
                    }
                  }
                : undefined
            }
            onSelect={addExisting}
          />
        )
      )}

      {/*
       * Drafts' always-mounted fieldsets render on their own, in a
       * fixed creation order that never reorders — reordering (or moving
       * containers) would remount them and drop their picked file. Open
       * editors show here and aren't draggable; the collapsed chips
       * (below) carry no file input, so they reorder freely.
       */}
      {isMulti &&
        stableDrafts.map((entry) => (
          <div
            key={entryId(entry)}
            className={itemPickerStyles['item-picker-multi-slot']}
          >
            {renderDraftFieldset(entry, entryIndex(entry))}
          </div>
        ))}

      {/*
       * Existing items and saved drafts share one list so they reorder
       * together; drag controls only on chips with a same-group
       * neighbour (`isSameGroup`).
       */}
      {isMulti ? (
        !sortBy && sortableEntries.some(isReorderable) ? (
          <>
            <SortableList
              className={itemPickerStyles['item-list']}
              items={sortableEntries.map((entry) => ({
                id: entryId(entry),
                entry
              }))}
              onReorder={(reordered) =>
                reorderSortable(reordered.map((entry) => entry.entry))
              }
              isSwappable={(a, b) => isSameGroup(a.entry, b.entry)}
              renderItem={(entry, _index, dragHandle) =>
                renderSortableRow(entry.entry, dragHandle)
              }
            />
            {defaultOrder && isCustomOrder && (
              <button
                type='button'
                className={`button-sm ${itemPickerStyles['reset-order-button']}`}
                onClick={resetToDefaultOrder}
              >
                <BarsArrowDownIcon /> {defaultOrder.resetLabel}
              </button>
            )}
          </>
        ) : (
          sortableEntries.length > 0 && (
            <div className={itemPickerStyles['item-list']}>
              {sortableEntries.map((entry) => (
                <div key={entryId(entry)}>
                  {renderSortableRow(entry)}
                </div>
              ))}
            </div>
          )
        )
      ) : (
        entries[0] && (
          <div
            className={itemPickerStyles['item-picker-single-slot']}
            key={entryId(entries[0])}
          >
            {renderEntry(entries[0], 0)}
          </div>
        )
      )}
    </div>
  )
}
