import { itemTypeSingulars } from '@/lib/schemas'

/**
 * How an item picker names the fields it submits, shared by the client
 * that renders them (`ItemPicker`, `SelectedResult`) and the server
 * that reads them back (the `resolve*Id` helpers,
 * `extractIndexedGroups`) so the two can't drift apart.
 */

/**
 * Form field name for a single-item picker's hidden id input:
 * `${singular(itemType)}Id` unless the picker names the relation
 * itself (`coverImageId` for an `images` item).
 */
export function itemIdFieldName(
  itemType: keyof typeof itemTypeSingulars,
  name?: string
): string {
  return name ?? `${itemTypeSingulars[itemType]}Id`
}

/**
 * Namespace a single-item picker's inline create/edit fields are
 * submitted under, derived from the id field they accompany:
 * `venueId` -> `venue.`, `coverImageId` -> `coverImage.`. Two pickers
 * of one item type in a form stay distinct as long as their id fields
 * do.
 */
export function itemFieldPrefix(idFieldName: string): string {
  return `${idFieldName.replace(/Id$/, '')}.`
}

/**
 * Namespace one entry of a multi picker's list is submitted under —
 * the indexed form `extractIndexedGroups()` reads back.
 */
export function indexedItemFieldPrefix(
  name: string,
  index: number
): string {
  return `${name}[${index}].`
}

/**
 * Hidden flag a multi picker submits while one of its entries is pinned
 * as featured, and only then — so a list with no explicit choice
 * round-trips with none (contrast `images`, where position 0 always
 * means cover).
 */
export function featuredFlagFieldName(name: string): string {
  return `${name}Featured`
}

/**
 * Empty-list marker a multi picker always submits, so a list emptied
 * of every entry still reaches the server as a submitted-but-empty
 * field rather than an absent one. Matched (and discarded) by
 * `extractIndexedGroups()`.
 */
export function emptyListFieldName(name: string): string {
  return `${name}[]`
}
