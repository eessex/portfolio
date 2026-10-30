import type { EmbeddedItemType, PagePath } from '@/lib/schemas'
import { isEmbeddedItemType } from '@/lib/schemas'

/**
 * Per-embedded-item-type image column visibility, so items-table
 * can hide the column rather than leave it blank for types with no
 * cover image of their own.
 */
const embeddedItemColumns: Record<
  EmbeddedItemType,
  { hasImage: boolean }
> = {
  embedCodes: { hasImage: true },
  images: { hasImage: true },
  links: { hasImage: false },
  publishedEditions: { hasImage: true },
  publishers: { hasImage: false },
  venues: { hasImage: false }
}

export function isImageColumnVisible(
  itemType: EmbeddedItemType | PagePath
) {
  return (
    !isEmbeddedItemType(itemType) ||
    embeddedItemColumns[itemType].hasImage
  )
}

export function isEmbeddedDetailColumnVisible(
  itemType: EmbeddedItemType | PagePath
) {
  return isEmbeddedItemType(itemType)
}
