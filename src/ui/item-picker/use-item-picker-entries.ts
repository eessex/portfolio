import { useEffect, useRef, useState } from 'react'

import type { EmbeddedItem, PageItemClient } from '@/lib/types'
import {
  type Draft,
  entryId,
  isDraft,
  type ItemPickerEntry
} from '@/ui/item-picker/item-picker-entry'
import type { useEntryValidation } from '@/ui/item-picker/use-entry-validation'

type EntryValidation = Pick<
  ReturnType<typeof useEntryValidation>,
  | 'validateEntryStrict'
  | 'clearErrors'
  | 'readEntryValues'
  | 'hasEntryContent'
>

interface UseItemPickerEntriesOptions<TItem> {
  isMulti: boolean
  existingItems: TItem[]
  /** Open on a blank create form (see `ItemPicker`'s `isSearchFirst`). */
  isCreateFirst: boolean
  featured?: { isInitiallyFeatured: boolean }
  /** See `ItemPicker`'s `defaultOrder.compare`. */
  compareDefaultOrder?: (
    a: Record<string, unknown>,
    b: Record<string, unknown>
  ) => number
  /** See `ItemPicker`'s `defaultOrder.group`. */
  orderGroup?: (values: Record<string, unknown>) => number
  validation: EntryValidation
}

/**
 * An `ItemPicker`'s entry list: state, mutators, and derived views.
 */
export function useItemPickerEntries<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient
>({
  isMulti,
  existingItems,
  isCreateFirst,
  featured,
  compareDefaultOrder,
  orderGroup,
  validation: {
    validateEntryStrict,
    clearErrors,
    readEntryValues,
    hasEntryContent
  }
}: UseItemPickerEntriesOptions<TEmbeddedItem | TPage>) {
  type Entry = ItemPickerEntry<TEmbeddedItem, TPage>

  const startWithBlankEntry =
    isCreateFirst && (isMulti || existingItems.length === 0)

  const nextSeq = useRef(startWithBlankEntry ? 1 : 0)
  const [entries, setEntries] = useState<Entry[]>(() => {
    const items = existingItems.map((item) => ({
      kind: 'existing' as const,
      item
    }))
    const head = featured?.isInitiallyFeatured
      ? items.slice(0, 1)
      : []
    const existing = [
      ...head,
      ...keepGroups(items.slice(head.length))
    ]
    if (!startWithBlankEntry) return existing
    const blank = { kind: 'new' as const, tempId: 'new-0', seq: 0 }
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
  // Per-draft-entry flag, keyed by tempId: true while the entry's edit
  // form has async work in flight (`renderEditItemForm`'s `onBusyChange`).
  const [busyEntries, setBusyEntries] = useState<
    Record<string, boolean>
  >({})

  const entriesRef = useRef(entries)
  useEffect(() => {
    entriesRef.current = entries
  }, [entries])
  useEffect(() => {
    return () => {
      entriesRef.current.forEach((entry) => {
        if (isDraft(entry) && entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl)
        }
      })
    }
  }, [])

  const featuredEntry =
    featured && isFeatured ? entries[0] : undefined
  const restEntries = featuredEntry ? entries.slice(1) : entries
  // Draft entries (new + edited-existing) both carry a mounted fieldset.
  const restDrafts = restEntries.filter(isDraft)
  // Draft fieldsets render in fixed creation order: moving one remounts
  // it and drops its `<input type=file>`. Chips (no fieldset) share
  // one sortable list (`sortableEntries`).
  const stableDrafts = [...restDrafts].sort((a, b) => a.seq - b.seq)
  const sortableEntries = restEntries.filter(
    (entry) => entry.kind === 'existing' || entry.isSaved
  )
  // submit index = array slot (+1 past a featured head); reopened
  // chips keep their slot, so order survives submit with editor open
  const restIndex = (entry: Entry) =>
    entry === featuredEntry
      ? 0
      : restEntries.indexOf(entry) + (featuredEntry ? 1 : 0)
  // The one open editor, if any — including the featured entry's.
  const openDraft = entries.find(
    (entry): entry is Draft<TEmbeddedItem, TPage> =>
      isDraft(entry) && !entry.isSaved
  )
  const hasOpenDraft = !!openDraft
  const isCustomOrder = !isInDefaultOrder(
    splitEntries(entries).positioned
  )

  /** Needs another chip in its own group to move. */
  function isReorderable(entry: Entry) {
    if (!orderGroup) return sortableEntries.length > 1
    const group = orderGroup(entryValues(entry))
    return (
      sortableEntries.filter(
        (other) => orderGroup(entryValues(other)) === group
      ).length > 1
    )
  }

  /** Whether two chips share an `orderGroup` (and so can swap). */
  function isSameGroup(a: Entry, b: Entry) {
    if (!orderGroup) return true
    return orderGroup(entryValues(a)) === orderGroup(entryValues(b))
  }

  function splitEntries(list: Entry[]) {
    const head =
      featured && isFeatured && list.length > 0 ? [list[0]] : []
    const rest = list.slice(head.length)
    return {
      head,
      rest,
      chips: rest.filter(isChip),
      positioned: rest.filter(hasChipPosition)
    }
  }

  function isChip(entry: Entry) {
    return entry.kind === 'existing' || !!entry.isSaved
  }

  /** Chips plus reopened chips; excludes never-saved new drafts. */
  function hasChipPosition(entry: Entry) {
    return entry.kind !== 'new' || !!entry.summaryData
  }

  function placeInSlots(
    list: Entry[],
    ordered: Entry[],
    isSlot: (entry: Entry) => boolean
  ) {
    const { head, rest } = splitEntries(list)
    let i = 0
    return [
      ...head,
      ...rest.map((entry) => (isSlot(entry) ? ordered[i++] : entry))
    ]
  }

  /** Item merged with saved draft values. */
  function entryValues(entry: Entry): Record<string, unknown> {
    const item =
      entry.kind === 'new'
        ? {}
        : (entry.item as Record<string, unknown>)
    return isDraft(entry) && entry.summaryData
      ? { ...item, ...entry.summaryData }
      : item
  }

  function isInDefaultOrder(chips: Entry[]) {
    if (!compareDefaultOrder) return true
    return chips.every(
      (entry, i) =>
        i === 0 ||
        compareDefaultOrder(
          entryValues(chips[i - 1]),
          entryValues(entry)
        ) <= 0
    )
  }

  /** Stable sort by `orderGroup`. */
  function keepGroups<T extends Entry>(chips: T[]) {
    if (!orderGroup) return chips
    return [...chips].sort(
      (a, b) =>
        orderGroup(entryValues(a)) - orderGroup(entryValues(b))
    )
  }

  function sortByDefaultOrder(chips: Entry[]) {
    if (!compareDefaultOrder) return chips
    return [...chips].sort((a, b) =>
      compareDefaultOrder(entryValues(a), entryValues(b))
    )
  }

  /** Re-sorts `next` unless `previous` was in a custom order. */
  function keepDefaultOrder(previous: Entry[], next: Entry[]) {
    if (!compareDefaultOrder) return next
    const { chips } = splitEntries(next)
    const sorted = isInDefaultOrder(splitEntries(previous).positioned)
      ? sortByDefaultOrder(chips)
      : keepGroups(chips)
    return placeInSlots(next, sorted, isChip)
  }

  function mintTempId() {
    const seq = nextSeq.current++
    return { tempId: `new-${seq}`, seq }
  }

  /** Releases an entry's side resources: preview URL, errors, busy flag. */
  function disposeEntry(entry: Entry) {
    if (!isDraft(entry)) return
    if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
    clearErrors(entry.tempId)
    setBusyEntries((current) => {
      if (!(entry.tempId in current)) return current
      const { [entry.tempId]: _, ...rest } = current
      return rest
    })
  }

  function insertEntry(current: Entry[], entry: Entry) {
    if (!isMulti) return [entry]
    // Keep a pinned featured entry at the front; new picks join the
    // (reorderable) rest right after it instead of displacing it.
    if (featured && isFeatured && current.length > 0) {
      return [current[0], entry, ...current.slice(1)]
    }
    return [entry, ...current]
  }

  function removeEntry(entry: Entry) {
    if (featuredEntry && entryId(featuredEntry) === entryId(entry)) {
      setIsFeatured(false)
    }
    disposeEntry(entry)
    setEntries((current) =>
      current.filter((s) => entryId(s) !== entryId(entry))
    )
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
      return keepDefaultOrder(
        current,
        insertEntry(current, { kind: 'existing', item })
      )
    })
  }

  /** Opens a blank create editor, returning its tempId. */
  function addNew(query?: string) {
    const ids = mintTempId()
    setEntries((current) =>
      insertEntry(current, { kind: 'new', query, ...ids })
    )
    return ids.tempId
  }

  /**
   * Opens an already-attached item for inline editing: swaps its
   * read-only `existing` entry for an `editing` entry (same item, fresh
   * tempId) that mounts the edit fieldset seeded with the item. Returns
   * the new tempId, or `undefined` if an open editor blocked it (see
   * `closeOpenDrafts`).
   */
  function editExisting(id: string) {
    if (!closeOpenDrafts()) return undefined
    const ids = mintTempId()
    setEntries((current) =>
      current.map((s) =>
        s.kind === 'existing' && entryId(s) === id
          ? { kind: 'editing' as const, item: s.item, ...ids }
          : s
      )
    )
    return ids.tempId
  }

  /**
   * Cancels an in-progress edit of an existing item, restoring its
   * read-only `existing` chip and discarding the edits — the editing
   * counterpart to discarding a `new` draft (which removes it entirely).
   */
  function revertEditingEntry(entry: Entry) {
    if (entry.kind !== 'editing') return
    disposeEntry(entry)
    setEntries((current) =>
      keepDefaultOrder(
        current,
        current.map((s) =>
          entryId(s) === entryId(entry)
            ? { kind: 'existing' as const, item: entry.item }
            : s
        )
      )
    )
  }

  // Flag a draft entry as touched the first time the user edits any
  // field. Callers skip already-touched entries.
  function markEntryTouched(tempId: string) {
    setEntries((current) =>
      current.map((s) =>
        isDraft(s) && s.tempId === tempId
          ? { ...s, isTouched: true }
          : s
      )
    )
  }

  function setBusyEntry(tempId: string, isBusy: boolean) {
    setBusyEntries((current) =>
      current[tempId] === isBusy
        ? current
        : { ...current, [tempId]: isBusy }
    )
  }

  /**
   * Validates a single draft entry and, on success, collapses it into
   * its saved state — the fieldset stays mounted, hidden, and renders
   * a chip in its place. Snapshots the fieldset's values (`summaryData`)
   * and, for any picked file, a `previewUrl`, since the collapsed chip
   * renders from state rather than reading the (now hidden, and
   * ref-only-outside-render) fieldset directly.
   */
  function saveDraft(
    entry: Draft<TEmbeddedItem, TPage>,
    submitIndex: number
  ): boolean {
    if (!validateEntryStrict(entry.tempId, submitIndex)) return false

    const { summaryData, file } = readEntryValues(
      entry.tempId,
      submitIndex
    )
    const previewUrl = file ? URL.createObjectURL(file) : undefined

    setEntries((current) =>
      keepDefaultOrder(
        current,
        current.map((s) =>
          isDraft(s) && s.tempId === entry.tempId
            ? { ...s, isSaved: true, previewUrl, summaryData }
            : s
        )
      )
    )
    return true
  }

  /**
   * Reopens a saved draft. Revokes its preview URL (Save makes a new
   * one); keeps `summaryData` for default ordering.
   */
  function editDraft(entry: Draft<TEmbeddedItem, TPage>): boolean {
    // Keeps `isTouched`: the entry has content, so toggling back to
    // search should still fold it to a chip.
    if (!closeOpenDrafts()) return false
    if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
    setEntries((current) =>
      current.map((s) =>
        isDraft(s) && s.tempId === entry.tempId
          ? {
              ...s,
              isSaved: false,
              previewUrl: undefined
            }
          : s
      )
    )
    return true
  }

  /**
   * Closes an open editor, validating first — only an untouched new
   * draft with nothing entered is dropped unchecked. A valid untouched edit
   * reverts; anything else saves to its chip. Returns how it closed,
   * or `undefined` if invalid (left open with its errors).
   */
  function closeDraft(
    entry: Draft<TEmbeddedItem, TPage>
  ): 'discarded' | 'saved' | undefined {
    if (
      entry.kind === 'new' &&
      !entry.isTouched &&
      !hasEntryContent(entry.tempId)
    ) {
      removeEntry(entry)
      return 'discarded'
    }
    if (entry.kind === 'editing' && !entry.isTouched) {
      if (!validateEntryStrict(entry.tempId, restIndex(entry))) {
        return undefined
      }
      revertEditingEntry(entry)
      return 'discarded'
    }
    return saveDraft(entry, restIndex(entry)) ? 'saved' : undefined
  }

  /**
   * Closes every open editor (`closeDraft`) so another can expand —
   * only one is ever open. Returns false if one stays open invalid.
   */
  function closeOpenDrafts(): boolean {
    for (const entry of entries) {
      if (!isDraft(entry) || entry.isSaved) continue
      if (!closeDraft(entry)) return false
    }
    return true
  }

  function setFeatured(entry: Entry) {
    setEntries((current) => {
      const index = current.findIndex(
        (s) => entryId(s) === entryId(entry)
      )
      if (index === -1) return current
      return [
        current[index],
        ...current.filter((_, i) => i !== index)
      ]
    })
    setIsFeatured(true)
  }

  function unsetFeatured() {
    setIsFeatured(false)
  }

  /** Applies a drag reorder of `sortableEntries`. */
  function reorderSortable(reordered: Entry[]) {
    setEntries((current) =>
      placeInSlots(current, keepGroups(reordered), isChip)
    )
  }

  function resetToDefaultOrder() {
    setEntries((current) =>
      placeInSlots(
        current,
        sortByDefaultOrder(splitEntries(current).positioned),
        hasChipPosition
      )
    )
  }

  return {
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
    reorderSortable,
    isReorderable,
    isSameGroup,
    isCustomOrder,
    resetToDefaultOrder
  }
}
