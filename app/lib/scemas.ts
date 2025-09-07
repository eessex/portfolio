import { z } from 'zod'

/**
 * START Basic reusable schemas
 * These are the building blocks for more complex schemas below.
 * They may be used in multiple places.
 */

export const uuid = z.string().uuid()
export const date = z.date()
export const shortText = z.string().max(255)
export const longText = z.string().max(1000)
export const url = shortText.url()
export const slug = shortText.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const bool = z.boolean()
export const email = z.string().email()

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
export const baseContentSchema = defaultSchema.extend({
  tagIds: z.array(uuid).default([]),
  title: shortText.optional(),
  projectId: uuid.optional()
})

/**
 * Fields on all "page" tables: coverImageId, description, isPublished, slug
 */
export const basePageSchema = baseContentSchema.extend({
  coverImageId: uuid.optional(),
  description: longText.optional(),
  isPublished: bool.optional(),
  slug
})

/**
 * Fields on items visible in dashboard: eventSlugs, releaseSlugs
 * Represents the slugs of pages that embed the item.
 */
export const baseDashboardItemSchema = z.object({
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
 * Site settings represent global settings for the site.
 * There should only be one row in the table.
 * These settings are used to populate SEO meta tags and other site-wide settings.
 */
export const SettingsSchema = defaultSchema.extend({
  coverImageId: basePageSchema.shape.coverImageId,
  description: basePageSchema.shape.description,
  title: basePageSchema.shape.title,
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

/**
 * The about page, with contact info and other details.
 */
export const AboutContactSchema = z.object({ title: shortText, contact: shortText })

export const AboutSchema = defaultSchema.extend({
  contactInfo: z.array(AboutContactSchema).optional(),
  coverImageId: basePageSchema.shape.coverImageId,
  description: basePageSchema.shape.description,
  featuredEmbedCodeId: uuid.optional(),
  slug: basePageSchema.shape.slug
})

/**
 * An event, such as a concert, performance, opening, or screening.
 */
export const EventSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas.shape,
  endDate: date.optional(),
  startDate: date,
  ticketLink: url.optional(),
  venueId: uuid,
})

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

export const publishedEditionTypes = ['LP', '2xLP', 'Cassette', '2xCassette', 'Digital', 'iOSApp', 'CD'] as const
/**
 * Represents a published edition of a release, such as a vinyl pressing, cassette or digital edition.
 * This is separate from the Release itself, which represents the overall work.
 * A release may have multiple editions, each with its own format, publish date, and publisher.
 * This allows for tracking different versions of a release, such as a first pressing and a reissue.
 */
export const PublishedEditionSchema = baseContentSchema.extend({
  releaseId: ReleaseSchema.shape.id,
  publisher: shortText,
  format: z.enum(publishedEditionTypes),
  publishDate: date,
  coverImageId: basePageSchema.shape.coverImageId,
  imageIds: embeddedItemIdSchemas.shape.imageIds,
  editionSize: z.number().int().optional(),
  buyLinkId: uuid.optional()
})
