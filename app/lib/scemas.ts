import { embedCodeSchema } from '@/lib/embed-codes/schemas'
import { imageSchema } from '@/lib/images/schemas'
import { linkSchema } from '@/lib/links/schemas'
import { projectSchema } from '@/lib/projects/schemas'
import { publishedEditionSchema } from '@/lib/published-edition/schemas'
import { z } from 'zod'
import { tagSchema } from './tags/schemas'
import { venueSchema } from './venues/schemas'

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
// handle nested dates in jsonb objects or a real date
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

/**
 * Fields on all content tables: tagIds, title, projectId
 */
export const baseContentSchema = z.object({
  tagIds: z.array(uuid).default([]),
  title: shortText.optional(),
  projectId: uuid.optional()
}).extend(defaultSchema.shape)

/**
 * Fields on all "page" tables: coverImageId, description, isPublished, slug
 */
export const basePageSchema = z.object({
  coverImageId: uuid.optional(),
  description: longText.optional(),
  isPublished: bool.optional(),
  slug
}).extend(baseContentSchema.shape)

/**
 * Fields on items visible in dashboard: eventSlugs, releaseSlugs
 * Represents the slugs of pages that embed the item.
 */
export const baseDashboardItemSlugsSchema = z.object({
  eventSlugs: z.array(slug).optional(),
  releaseSlugs: z.array(slug).optional()
})

/**
 * IDs of items that can be embedded within pages,
 * their metadata will be included when fetching a page.
 */
export const embeddedItemIdSchemas = z.object({
  embedCodeIds: z.array(uuid).optional(),
  imageIds: z.array(uuid).optional(),
  linkIds: z.array(uuid).optional(),
})

/**
 * IDs of items that can be embedded within pages,
 * their metadata will be included when fetching a page.
 */
export const hydratedItemIdSchemas = z.object({
  coverImage: imageSchema.optional(),
  embedCodes: z.lazy(() => embedCodeSchema.array()).optional(),
  featuredEmbedCode: z.lazy(() => embedCodeSchema).optional(),
  images: z.array(imageSchema).optional(),
  links: z.array(linkSchema).optional(),
  project: projectSchema.optional(),
  publishedEditions: z.array(publishedEditionSchema).optional(),
  tags: z.array(tagSchema).optional(),
  venue: venueSchema.optional(),
})

/**
 * END Basic reusable schemas
 */

/**
 * START Utility types and interfaces
 * They don't generally have their own standalone pages in the client.
 */

/**
 * User represents an admin user who can log into the CMS.
 */
export const UserSchema = defaultSchema.extend({
  name: shortText,
  email,
  password: z.string().min(8)
})

/**
 * Newsletter subscription
 */
export const EmailSubscriptionSchema = defaultSchema.extend({
  email,
  exportedAt: date.optional()
})

/**
 * Slug history to track changes to slugs for SEO and redirect purposes.
 */
export const SlugHistorySchema = baseContentSchema.omit({ updatedAt: true }).extend({
  tableName: z.string().max(50),
  rowId: uuid,
  oldSlug: slug
})

/**
 * END Utility types and interfaces
 */

/**
 * START Page schemas
 * Data types that have their own standalone pages in the client.
 * These schemas are used to validate data fetched from the database.
 * They may include references to embedded items.
 */

export const releaseTypes = ['album', 'ep', 'soundtrack', 'feature', 'compilation', 'collaborative_release', 'single'] as const
/**
 * A music release, such as an album, EP, single, or soundtrack.
 */
export const ReleaseSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas.shape,
  artist: shortText,
  type: z.enum(releaseTypes),
  releaseDate: date,
})

/**
 * END Page schemas
 */
