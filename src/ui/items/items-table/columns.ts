import type { EmbeddedItemType, PagePath } from '@/lib/schemas'
import { isEmbeddedItemType } from '@/lib/schemas'

/**
 * Per-embedded-item-type image column visibility, so items-table
 * can hide the column rather than leave it blank for types with no
 * cover image of their own.
 */
const embeddedItemColumns: Record<
  EmbeddedItemType,
  { isImageShown: boolean }
> = {
  embedCodes: { isImageShown: true },
  images: { isImageShown: true },
  links: { isImageShown: false },
  publishedEditions: { isImageShown: true },
  publishers: { isImageShown: false },
  venues: { isImageShown: false }
}

export function isImageColumnVisible(
  itemType: EmbeddedItemType | PagePath
) {
  return (
    !isEmbeddedItemType(itemType) ||
    embeddedItemColumns[itemType].isImageShown
  )
}

export function isEmbeddedDetailColumnVisible(
  itemType: EmbeddedItemType | PagePath
) {
  return isEmbeddedItemType(itemType)
}
