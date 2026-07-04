import { z } from 'zod'

/**
 * Types of pages that can have paths
 * (i.e. that can be accessed on the public site)
 * These values correspond to a `/{path}` index page
 * as well as `/{path}/{slug}` pages for individual entries.
 */
export const pagePaths = [
  'about',
  'events',
  'projects',
  'releases'
] as const

export const PagePaths = Object.fromEntries(
  pagePaths.map((v) => [v, v])
) as {
  [K in (typeof pagePaths)[number]]: K
}
export const pagePathSchema = z.enum(pagePaths)
export type PagePath = (typeof pagePaths)[number]

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
  'venues'
] as const
export const EmbeddedItemTypes = Object.fromEntries(
  embeddedItemTypes.map((v) => [v, v])
) as {
  [K in (typeof embeddedItemTypes)[number]]: K
}
export type EmbeddedItemType = (typeof embeddedItemTypes)[number]
