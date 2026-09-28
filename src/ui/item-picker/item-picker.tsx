'use client'

import clsx from 'clsx'
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
import { Combobox } from '@/ui/combobox/combobox'
import { SortableList } from '@/ui/drag-and-drop/sortable-list'
import { InputLabel } from '@/ui/form/input-label'
import { DraftChip } from '@/ui/item-picker/draft-chip'
import { DraftFieldset } from '@/ui/item-picker/draft-fieldset'
import { ExistingEntryRow } from '@/ui/item-picker/existing-entry-row'
import { FeaturedToggleButton } from '@/ui/item-picker/featured-toggle-button'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import {
  type Draft,
  entryId,
  type ItemPickerEntry
} from '@/ui/item-picker/item-picker-entry'
import {
  type FieldErrors,
  useEntryValidation
} from '@/ui/item-picker/use-entry-validation'
import { useItemPickerEntries } from '@/ui/item-picker/use-item-picker-entries'
import type { ResultsResponse } from '@/ui/useResultsList'
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
    | { isMulti?: false; existingItem?: TEmbeddedItem | TPage }
    | {
        isMulti: true
        existingItems?: (TEmbeddedItem | TPage)[]
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
    name,
    renderExistingResult,
    renderEditItemForm,
    isMulti,
    schema,
    renderNewItemSummary,
    isSearchFirst: isSearchFirstProp
  } = props

  const featured = props.isMulti ? props.featured : undefined
  const singleIdFieldName = itemIdFieldName(itemType, name)
  const listFieldName = name ?? itemType

  const isSearchFirst = !!renderEditItemForm && !!isSearchFirstProp
  const isCreateFirst = !!renderEditItemForm && !isSearchFirst

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
    featuredEntry,
    openDraft,
    stableDrafts,
    sortableEntries,
    restIndex,
    hasOpenDraft,
    addExisting,
    addNew,
    editExisting,
    removeEntry,
    revertEditingEntry,
    markEntryTouched,
    setBusyEntry,
    saveDraft,
    editDraft,
    closeDraft,
    closeOpenDrafts,
    setFeatured,
    unsetFeatured,
    reorderSortable
  } = useItemPickerEntries<TEmbeddedItem, TPage>({
    isMulti: !!isMulti,
    existingItems: isMulti
      ? (props.existingItems ?? [])
      : props.existingItem
        ? [props.existingItem]
        : [],
    isCreateFirst,
    featured,
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
  // Entry count as of the last commit, so the focus effect can detect a
  // single-item picker emptying (1 → 0).
  const prevEntryCount = useRef(entries.length)

  const itemLabel = label || itemTypeToLabel(itemType, true)
  const newLabel = `New ${itemTypeToLabel(itemType, true, true)}`
  const saveLabel = `Save ${itemTypeToLabel(itemType, true, true)}`
  const removeLabel = `Remove ${itemTypeToLabel(itemType, true, true)}`
  const featuredLabel = featured?.label || 'Featured'

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

  function featuredControl(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    isCurrentlyFeatured: boolean
  ) {
    if (!featured) return undefined
    return (
      <FeaturedToggleButton
        isCurrentlyFeatured={isCurrentlyFeatured}
        onToggle={
          isCurrentlyFeatured
            ? unsetFeatured
            : () => setFeatured(entry)
        }
        featuredLabel={featuredLabel}
      />
    )
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
    // or after an edit in create mode. Otherwise the saved entry
    // collapses to its chip.
    if (isMulti && (entry.kind === 'new' || mode === 'create')) {
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
    if (!isMulti) {
      // The reverted row replaces the editor; focus its Edit button.
      pendingFocus.current = { kind: 'edit', id: entry.item.id }
    } else if (mode === 'create') {
      pendingFocus.current = { kind: 'create', tempId: addNew() }
    } else {
      pendingFocus.current = { kind: 'combobox' }
    }
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
        isSearchFirst={isSearchFirst}
        legend={entry.kind === 'editing' ? itemLabel : newLabel}
        saveLabel={saveLabel}
        onSave={() => handleSave(entry, submitIndex)}
        onCancelEdit={
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
    dragHandle?: React.ReactNode,
    featuredButton?: React.ReactNode
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
        featuredButton={featuredButton}
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
          renderEditItemForm
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
    dragHandle?: React.ReactNode,
    featuredButton?: React.ReactNode
  ) {
    return entry.kind === 'existing' ? (
      renderExistingEntry(entry, index, dragHandle, featuredButton)
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
    const index = restIndex(entry)
    return entry.kind === 'existing'
      ? renderEntry(
          entry,
          index,
          dragHandle,
          featuredControl(entry, false)
        )
      : renderDraftChip(entry, dragHandle)
  }

  // Multi always shows the combobox, single shows it only to search
  // (empty list) or while a draft is open (the toggle carries label + Search).
  const showCombobox = isMulti || entries.length === 0 || hasOpenDraft

  return (
    <div
      className={clsx(
        itemPickerStyles['item-picker'],
        !isMulti && itemPickerStyles['item-picker-single']
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
                  if (returnToSearch()) setMultiMode('search')
                }
          }
          renderExistingResult={renderExistingResult}
          onCreateNew={
            renderEditItemForm
              ? (q) => {
                  // Collapse open drafts before adding another.
                  if (!closeOpenDrafts()) return
                  setMultiMode('create')
                  pendingFocus.current = {
                    kind: 'create',
                    tempId: addNew(q || undefined)
                  }
                }
              : undefined
          }
          onSelect={addExisting}
        />
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
            {renderDraftFieldset(entry, restIndex(entry))}
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
       * collapsed saved drafts together — so they reorder relative to
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
              reorderSortable(reordered.map((entry) => entry.entry))
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
