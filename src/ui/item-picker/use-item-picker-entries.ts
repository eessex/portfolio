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
  'validateEntryStrict' | 'clearErrors' | 'readEntryValues'
>

interface UseItemPickerEntriesOptions<TItem> {
  isMulti: boolean
  existingItems: TItem[]
  /** Open on a blank create form (see `ItemPicker`'s `isSearchFirst`). */
  isCreateFirst: boolean
  featured?: { isInitiallyFeatured: boolean }
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
  validation: { validateEntryStrict, clearErrors, readEntryValues }
}: UseItemPickerEntriesOptions<TEmbeddedItem | TPage>) {
  type Entry = ItemPickerEntry<TEmbeddedItem, TPage>

  const startWithBlankEntry =
    isCreateFirst && (isMulti || existingItems.length === 0)

  const nextSeq = useRef(startWithBlankEntry ? 1 : 0)
  const [entries, setEntries] = useState<Entry[]>(() => {
    const existing = existingItems.map((item) => ({
      kind: 'existing' as const,
      item
    }))
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
  // A saved draft entry's `<input type=file>` can't be repopulated, so
  // its fieldset must never move containers or reorder (either remounts
  // it and drops the file). So the always-mounted draft fieldsets render
  // on their own in a fixed creation order that never changes, while the
  // *chips* — which carry no file input — reorder freely. Since existing
  // entries are likewise fieldset-free, their results and the saved draft
  // chips share ONE sortable list (`sortableEntries`); only open editors
  // (`openRestDrafts`) stay fixed, ahead of it.
  const openRestDrafts = restDrafts.filter((entry) => !entry.isSaved)
  const stableDrafts = [...restDrafts].sort((a, b) => a.seq - b.seq)
  const sortableEntries = restEntries.filter(
    (entry) => entry.kind === 'existing' || entry.isSaved
  )
  // An entry's submit/action index is its position in the canonical rest
  // order — open editors first, then the sortable chips — offset past
  // any pinned featured entry at the array head.
  const orderedRest = [...openRestDrafts, ...sortableEntries]
  const restIndex = (entry: Entry) =>
    entry === featuredEntry
      ? 0
      : orderedRest.indexOf(entry) + (featuredEntry ? 1 : 0)
  // The one open editor, if any — including the featured entry's, which
  // `openRestDrafts` (rest only) leaves out.
  const openDraft = entries.find(
    (entry): entry is Draft<TEmbeddedItem, TPage> =>
      isDraft(entry) && !entry.isSaved
  )
  const hasOpenDraft = !!openDraft

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

  /** An untouched blank create editor, safe to drop when another opens. */
  function isStrayDraft(entry: Entry, exceptTempId?: string) {
    return (
      entry.kind === 'new' &&
      !entry.isSaved &&
      !entry.isTouched &&
      entry.tempId !== exceptTempId
    )
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
      return insertEntry(current, { kind: 'existing', item })
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
   * the new tempId.
   */
  function editExisting(id: string) {
    const ids = mintTempId()
    // Hide untouched-blank create form when editor opens, only one
    // form is open at once (create mode re-seeds on editor close).
    entries.filter((s) => isStrayDraft(s)).forEach(disposeEntry)
    setEntries((current) =>
      current
        .filter((s) => !isStrayDraft(s))
        .map((s) =>
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
      current.map((s) =>
        entryId(s) === entryId(entry)
          ? { kind: 'existing' as const, item: entry.item }
          : s
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
      current.map((s) =>
        isDraft(s) && s.tempId === entry.tempId
          ? { ...s, isSaved: true, previewUrl, summaryData }
          : s
      )
    )
    return true
  }

  /**
   * Re-expands a saved draft entry for editing, revoking its preview
   * object URL — Save creates a fresh one when the entry is next saved.
   */
  function editDraft(entry: Draft<TEmbeddedItem, TPage>) {
    // Only one editor open at a time: drop any *other* still-untouched
    // create editor (the one Save auto-reopens for the next item) as
    // this entry re-expands, so editing doesn't leave a stray file input
    // open beside its edit form. Only `new` strays are disposable —
    // an untouched `editing` entry still owns an item, so it's never
    // pruned. Its `isTouched` is kept — the entry has content, so toggling
    // back to search should still fold it to a chip.
    entries
      .filter((s) => isStrayDraft(s, entry.tempId))
      .forEach(disposeEntry)
    if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
    setEntries((current) =>
      current
        .filter((s) => !isStrayDraft(s, entry.tempId))
        .map((s) =>
          isDraft(s) && s.tempId === entry.tempId
            ? {
                ...s,
                isSaved: false,
                previewUrl: undefined,
                summaryData: undefined
              }
            : s
        )
    )
  }

  /**
   * Collapses every still-open draft entry into its saved chip. Run
   * when the user starts another entry, so completed entries fold up
   * instead of stacking open forms. Blocks (returns false) as soon as
   * an open entry is invalid, with `saveDraft`'s validation.
   */
  function saveOpenDrafts(): boolean {
    for (const entry of entries) {
      if (!isDraft(entry) || entry.isSaved) continue
      if (!saveDraft(entry, restIndex(entry))) return false
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
    setEntries([
      ...(featuredEntry ? [featuredEntry] : []),
      ...openRestDrafts,
      ...reordered
    ])
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
    saveOpenDrafts,
    setFeatured,
    unsetFeatured,
    reorderSortable
  }
}
