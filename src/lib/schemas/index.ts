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

/**
 * START Basic reusable schemas
 * These are the building blocks for more complex schemas below.
 * They may be used in multiple places.
 */

export const uuid = z.string().uuid()
export const shortText = z.string().max(255)
export const longText = z.string().max(5000)
export const url = shortText.url()
export const slug = shortText.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const bool = z.boolean()
export const email = z.string().email()
/** Handle nested dates in jsonb objects or a real date */
export const date = z.preprocess((val) => {
  if (typeof val === 'string' || val instanceof Date) {
    const parsed = new Date(val)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }
  return val
}, z.date())

/**
 * Fields on every table: id, createdAt, updatedAt
 */
export const defaultSchema = z.object({
  id: uuid,
  createdAt: date,
  updatedAt: date.optional()
})

export const defaultEditOmitFields = {
  createdAt: true,
  updatedAt: true
}

export const defaultCreateOmitFields = {
  ...defaultEditOmitFields,
  id: true
}

/**
 * Fields on all content tables: tagIds, title, projectId
 */
export const baseContentSchema = z
  .object({
    tagIds: z.array(uuid).optional(),
    title: shortText.optional(),
    projectId: uuid.optional()
  })
  .extend(defaultSchema.shape)

/**
 * Fields on all "page" tables: coverImageId, description, isPublished, slug
 */
export const basePageSchema = z
  .object({
    coverImageId: uuid.optional(),
    description: longText.optional(),
    isPublished: bool.optional(),
    path: pagePathSchema,
    slug
  })
  .extend(baseContentSchema.shape)

/**
 * Fields on items visible in dashboard: eventSlugs, releaseSlugs
 * Represents the slugs of pages that embed the item.
 */
export const baseEmbeddedItemSlugsSchema = z.object({
  eventSlugs: z.array(slug).optional(),
  projectSlugs: z.array(slug).optional(),
  releaseSlugs: z.array(slug).optional()
})

/**
 * IDs of items that can be embedded within pages,
 * their metadata will be included when fetching a page.
 */
export const embeddedItemIdSchemas = z.object({
  embedCodeIds: z.array(uuid).optional(),
  imageIds: z.array(uuid).optional(),
  linkIds: z.array(uuid).optional()
})

/**
 * END Basic reusable schemas
 */

/**
 * START Utility types and interfaces
 * They don't generally have their own standalone pages in the client.
 */
/**
 * Slug history to track changes to slugs for SEO and redirect purposes.
 */
export const SlugHistorySchema = baseContentSchema
  .omit({ updatedAt: true })
  .extend({
    tableName: z.string().max(50),
    rowId: uuid,
    oldSlug: slug
  })

/**
 * END Utility types and interfaces
 */
