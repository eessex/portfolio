/**
 * Fields shared by an entry with a mounted edit fieldset, tracking its
 * save/collapse lifecycle.
 */
interface ExpandedFields {
  tempId: string
  /** Set once the entry's Save action has validated it — the
   * fieldset stays mounted but collapses into a chip. */
  isSaved?: boolean
  /**
   * Set once the user edits any field in the entry's fieldset.
   */
  isTouched?: boolean
  /** Object URL for the entry's picked file, created on Save and
   * revoked on Edit/remove. */
  previewUrl?: string
  /**
   * Snapshot of the fieldset's collected + normalized values, taken on
   * Save for the collapsed chip to render from — reading the live
   * fieldset via ref during render isn't allowed, and the fieldset is
   * hidden (non-interactive) anyway while saved.
   */
  summaryData?: Record<string, unknown>
}

export type ItemPickerEntry<TEmbeddedItem, TPage> =
  | { kind: 'existing'; item: TEmbeddedItem | TPage }
  | ({ kind: 'new'; query?: string } & ExpandedFields)
  /**
   * An existing item opened for inline editing — reuses the `new`
   * entry's fieldset/collapse lifecycle, but carries the source `item`
   * so it can seed the edit form and submit a hidden `id` alongside its
   * edited fields (server sees id + fields → an `edited` entry that
   * UPDATEs rather than creates).
   */
  | ({
      kind: 'editing'
      item: TEmbeddedItem | TPage
    } & ExpandedFields)

/** An entry with a mounted edit fieldset: a new item or an edited existing one. */
export type ExpandedEntry<TEmbeddedItem, TPage> = Extract<
  ItemPickerEntry<TEmbeddedItem, TPage>,
  { kind: 'new' | 'editing' }
>

export function isEntryExpanded<TEmbeddedItem, TPage>(
  entry: ItemPickerEntry<TEmbeddedItem, TPage>
): entry is ExpandedEntry<TEmbeddedItem, TPage> {
  return entry.kind === 'new' || entry.kind === 'editing'
}

export function entryId(
  entry: ItemPickerEntry<unknown, unknown>
): string {
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
export function newEntrySeq(entry: { tempId: string }): number {
  return Number(entry.tempId.replace('new-', ''))
}
