import { z } from 'zod'

/**
 * START Basic reusable schemas
 * These are the building blocks for more complex schemas below.
 * They may be used in multiple places.
 */

const uuid = z.string().uuid()
const date = z.date()
const shortText = z.string().max(255)
const longText = z.string().max(1000)
const url = shortText.url()
const slug = shortText.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const bool = z.boolean()
const email = z.string().email()

/**
 * Fields on every table: id, createdAt, updatedAt
 */
const defaultSchema = z.object({
  id: uuid,
  createdAt: date,
  updatedAt: date.optional()
})

/**
 * Fields on all content tables: tagIds, title, projectId
 */
const baseContentSchema = defaultSchema.extend({
  tagIds: z.array(uuid).default([]),
  title: shortText.optional(),
  projectId: uuid.optional()
})

/**
 * Fields on all "page" tables: coverImageId, description, isPublished, slug
 */
const basePageSchema = baseContentSchema.extend({
  coverImageId: uuid.optional(),
  description: longText.optional(),
  isPublished: bool.optional(),
  slug
})

/**
 * Fields on items visible in dashboard: eventSlugs, releaseSlugs
 * Represents the slugs of pages that embed the item.
 */
const baseDashboardItemSchema = z.object({
  eventSlugs: z.array(slug).optional(),
  releaseSlugs: z.array(slug).optional()
})

/**
 * IDs of items that can be embedded within pages
 */
const embeddedItemIdSchemas = {
  embedCodeIds: z.array(uuid).optional(),
  imageIds: z.array(uuid).optional(),
  linkIds: z.array(uuid).optional(),
}

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
 * START Embedded item schemas
 * Data types that are typically embedded within other data types.
 * They don't generally have their own standalone pages in the client.
 */

/**
 * Tag represents a category or label that can be associated with content.
 * Tags can be used to filter and organize content.
 */
export const TagSchema = defaultSchema.extend({
  isPublished: bool.optional(),
})

export const embedCodeTypes = ['audio', 'video'] as const
/**
 * An iframe embed code, such as a Bandcamp or YouTube embed, with metadata.
 */
export const embedCodeSchema = baseContentSchema.extend({
  caption: shortText.optional(),
  iframe: longText.min(12),
  type: z.enum(embedCodeTypes).optional(),
})
export const dashboardEmbedCodeSchema = embedCodeSchema.extend(baseDashboardItemSchema.shape)

/**
 * An image with metadata.
 */
export const imageSchema = baseContentSchema.extend({
  alt: shortText.optional(),
  aspect: z.preprocess((val) => {
    if (typeof val === 'number') {
      return Number(val.toFixed(4))
    }
    if (typeof val === 'string') {
      const num = parseFloat(val)
      return isNaN(num) ? val : Number(num.toFixed(4))
    }
    return val
  }, z.number().min(0.1).max(10)),
  caption: shortText.optional(),
  isHiddenOnAboutPage: z.boolean().optional(),
  isPress: z.boolean().optional(),
  url
})
export const dashboardImageSchema = imageSchema.extend(baseDashboardItemSchema.shape)

export const linkTypes = ['press', 'social', 'buy_link', 'stream_link'] as const
/**
 * A link to an external resource with metadata.
 */
export const linkSchema = baseContentSchema.extend({
  attribution: shortText.optional(),
  isHiddenOnAboutPage: z.boolean().optional(),
  publishDate: date.optional(),
  quotation: shortText.optional(),
  type: z.enum(linkTypes).optional(),
  url
})
export const dashboardLinkSchema = linkSchema.extend(baseDashboardItemSchema.shape)

/**
 * A venue where an event or exhibition takes place.
 */
export const venueSchema = defaultSchema.extend({
  address: shortText.optional(),
  city: shortText,
  name: shortText.optional(),
  state: shortText.optional(),
  country: shortText.optional(),
  url: url.optional(),
  timezone: z.string().max(100).optional(),
  primaryVenueId: uuid.optional()
})
export const dashboardVenueSchema = venueSchema.extend({
  eventSlugs: baseDashboardItemSchema.shape.eventSlugs
})
/**
 * END Embedded item schemas
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
 * Represents a grouping of content that may be associated with multiple events, releases, exhibitions, or works.
 * Can represent a band, collaborative, or other entities like an ongoing radio show or event series.
 * It may be used to suggest content on pages, similar to a tag, but with a broader scope.
 *
 * Site settings is essentially the "default" project, a project should represent a subset of work the overall site.
 */
export const ProjectSchema = basePageSchema.omit({ projectId: true }).extend({
  ...embeddedItemIdSchemas
})

/**
 * An event, such as a concert, performance, opening, or screening.
 */
export const EventSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas,
  endDate: date.optional(),
  startDate: date,
  ticketLink: url.optional(),
  venueId: uuid,
})

/**
 * An exhibition, such as an art show.
 */
export const ExhibitionSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas,
  startDate: date,
  endDate: date.optional(),
  venueId: EventSchema.shape.venueId
})

export const releaseTypes = ['album', 'ep', 'soundtrack', 'feature', 'compilation', 'collaborative_release', 'single'] as const
/**
 * A music release, such as an album, EP, single, or soundtrack.
 */
export const ReleaseSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas,
  artist: shortText,
  type: z.enum(releaseTypes),
  releaseDate: date,
})

/**
 * A work, such as a piece of writing, visual art, design, musical composition, or other creative output.
 */
export const WorkSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas
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
  imageIds: embeddedItemIdSchemas.imageIds,
  editionSize: z.number().int().optional(),
  buyLinkId: uuid.optional()
})
