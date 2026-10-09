/**
 * Fields shared by an entry with a mounted edit fieldset, tracking its
 * save/collapse lifecycle.
 */
interface DraftFields {
  tempId: string
  /**
   * Creation order. Fieldsets render in this fixed order, which never
   * changes as chips reorder, so an entry's file input never remounts.
   */
  seq: number
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
   * Normalized field values snapshotted on Save for the chip to render
   * (can't read the fieldset ref during render). Kept on reopen for
   * default ordering.
   */
  summaryData?: Record<string, unknown>
}

export type ItemPickerEntry<TEmbeddedItem, TPage> =
  | { kind: 'existing'; item: TEmbeddedItem | TPage }
  | ({ kind: 'new'; query?: string } & DraftFields)
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
    } & DraftFields)

/** An entry with a mounted edit fieldset: a new item or an edited existing one. */
export type Draft<TEmbeddedItem, TPage> = Extract<
  ItemPickerEntry<TEmbeddedItem, TPage>,
  { kind: 'new' | 'editing' }
>

export function isDraft<TEmbeddedItem, TPage>(
  entry: ItemPickerEntry<TEmbeddedItem, TPage>
): entry is Draft<TEmbeddedItem, TPage> {
  return entry.kind === 'new' || entry.kind === 'editing'
}

export function entryId(
  entry: ItemPickerEntry<unknown, unknown>
): string {
  return entry.kind === 'existing' || entry.kind === 'editing'
    ? (entry.item as { id: string }).id
    : entry.tempId
}
