import { z } from 'zod'

import { camelToSentence, capitalizeFirstLetter } from '@/lib/strings'

/**
 * Types of pages that can have paths
 * (i.e. that can be accessed on the public site)
 * These values correspond to a `/{path}` index page
 * as well as `/{path}/{slug}` pages for individual entries.
 */
export const pagePaths = ['events', 'projects', 'releases'] as const

export const PagePaths = Object.fromEntries(
  pagePaths.map((v) => [v, v])
) as {
  [K in (typeof pagePaths)[number]]: K
}
export const pagePathSchema = z.enum(pagePaths)
export type PagePath = (typeof pagePaths)[number]

/**
 * Singular form of each `PagePath`, e.g. for deriving a form field name
 * like `releaseId` from the `releases` path.
 */
export const pagePathSingulars = {
  events: 'event',
  projects: 'project',
  releases: 'release'
} as const satisfies Record<PagePath, string>

/**
 * Types of items that can be embedded within pages
 * (e.g. an embed code, image, link, or venue).
 * Their metadata will be included when fetching a page.
 * These items do not have their own public-facing pages.
 * Items can be reused across multiple pages.
 */
export const embeddedItemTypes = [
  'embedCodes',
  'images',
  'links',
  'publishedEditions',
  'publishers',
  'venues'
] as const
export const EmbeddedItemTypes = Object.fromEntries(
  embeddedItemTypes.map((v) => [v, v])
) as {
  [K in (typeof embeddedItemTypes)[number]]: K
}
export type EmbeddedItemType = (typeof embeddedItemTypes)[number]

export const itemType = [
  ...pagePaths,
  ...embeddedItemTypes,
  'siteSettings'
] as const
export type ItemType = (typeof itemType)[number]

/**
 * Singular form of each `EmbeddedItemType`, e.g. for deriving a form field
 * name like `venueId` from the `venues` item type.
 */
export const embeddedItemTypeSingulars = {
  embedCodes: 'embedCode',
  images: 'image',
  links: 'link',
  publishedEditions: 'publishedEdition',
  publishers: 'publisher',
  venues: 'venue'
} as const satisfies Record<EmbeddedItemType, string>

/**
 * Combined singular-name lookup covering both `PagePath` and
 * `EmbeddedItemType` values, since `SelectedResult` accepts either.
 */
export const itemTypeSingulars = {
  ...pagePathSingulars,
  ...embeddedItemTypeSingulars,
  siteSettings: 'siteSettings'
} as const satisfies Record<
  PagePath | EmbeddedItemType | 'siteSettings',
  string
>
export type ItemTypeSingular =
  (typeof itemTypeSingulars)[keyof typeof itemTypeSingulars]

/**
 * Singular name for an item type, preferring the
 * `itemTypeSingulars` mapping and falling back to trimming a
 * trailing 's' for names outside the taxonomies.
 */
export function singularizePath(path: ItemType | ItemTypeSingular) {
  const mapped =
    itemTypeSingulars[path as keyof typeof itemTypeSingulars]
  if (mapped) return mapped

  if (
    (Object.values(itemTypeSingulars) as readonly string[]).includes(
      path as string
    )
  ) {
    return path
  }

  return path.endsWith('s') ? path.slice(0, -1) : path
}

/**
 * Human-readable label for an item type, e.g. `publishedEditions` →
 * 'Published editions', or 'published edition' with `isSingular` and
 * `isDownCased`. Used for UI headings/placeholders and server-action
 * response messages. Singularizes before formatting so the
 * `itemTypeSingulars` mapping (keyed by camelCase name) applies.
 */
export function itemTypeToLabel(
  itemType: ItemType | ItemTypeSingular,
  isSingular = false,
  isDownCased = false
) {
  const formatted = camelToSentence(
    isSingular ? singularizePath(itemType) : itemType
  ).toLowerCase()
  return isDownCased ? formatted : capitalizeFirstLetter(formatted)
}
