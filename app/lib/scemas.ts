import { z } from 'zod'

const uuid = z.string().uuid()
const date = z.date()
const shortText = z.string().max(255)
const longText = z.string().max(1000)
const url = shortText.url()
const slug = shortText.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const bool = z.boolean()
const email = z.string().email()

const defaultSchema = z.object({
  id: uuid,
  createdAt: date,
  updatedAt: date.optional()
})

const baseContentSchema = defaultSchema.extend({
  tagIds: z.array(uuid).default([]),
  title: shortText.optional(),
  projectId: uuid.optional()
})

const basePageSchema = baseContentSchema.extend({
  coverImageId: uuid.optional(),
  description: longText.optional(),
  isPublished: bool.optional(),
  slug
})

const baseDashboardItemSchema = z.object({
  eventSlugs: z.array(slug).optional(),
  releaseSlugs: z.array(slug).optional()
})

const embeddedItemIdSchemas = {
  embedCodeIds: z.array(uuid).optional(),
  imageIds: z.array(uuid).optional(),
  linkIds: z.array(uuid).optional(),
}

export const ProjectSchema = basePageSchema.omit({ projectId: true }).extend({
  ...embeddedItemIdSchemas
})

export const TagSchema = defaultSchema.extend({
  isPublished: bool.optional(),
})

export const UserSchema = defaultSchema.extend({
  name: shortText,
  email,
  password: z.string().min(8)
})

export const EmailSubscriptionSchema = defaultSchema.extend({
  email,
  exportedAt: date.optional()
})

export const SlugHistorySchema = baseContentSchema.omit({ updatedAt: true }).extend({
  tableName: z.string().max(50),
  rowId: uuid,
  oldSlug: slug
})

export const embedCodeSchema = baseContentSchema.extend({
  caption: shortText.optional(),
  iframe: longText.min(12),
  type: z.enum(['audio', 'video']).optional(),
})

export const dashboardEmbedCodeSchema = embedCodeSchema.extend(baseDashboardItemSchema.shape)

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

export const linkSchema = baseContentSchema.extend({
  attribution: shortText.optional(),
  isHiddenOnAboutPage: z.boolean().optional(),
  publishDate: date.optional(),
  quotation: shortText.optional(),
  type: z.enum(['press', 'social', 'buy_link', 'stream_link']).optional(),
  url
})

export const dashboardLinkSchema = linkSchema.extend(baseDashboardItemSchema.shape)

export const VenueSchema = defaultSchema.extend({
  address: shortText.optional(),
  city: shortText,
  name: shortText.optional(),
  state: shortText.optional(),
  country: shortText.optional(),
  url: url.optional(),
  timezone: z.string().max(100).optional(),
  primaryVenueId: uuid.optional()
})

/**
 * START Page schemas
 * Data types that have their own standalone pages in the client.
 * These schemas are used to validate data fetched from the database.
 * They may include references to embedded items.
 */

export const EventSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas,
  endDate: date.optional(),
  startDate: date,
  ticketLink: url.optional(),
  venueId: uuid,
})

export const ExhibitionSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas,
  startDate: date,
  endDate: date.optional(),
  venueId: EventSchema.shape.venueId
})

export const ReleaseSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas,
  artist: shortText,
  type: z.enum(['album', 'ep', 'soundtrack', 'feature', 'compilation', 'collaborative_release', 'single']),
  releaseDate: date,
})

export const WorkSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas
})

export const SettingsSchema = defaultSchema.extend({
  coverImageId: basePageSchema.shape.coverImageId,
  description: basePageSchema.shape.description,
  title: basePageSchema.shape.title,
})

export const AboutContactSchema = z.object({ title: shortText, contact: shortText })

export const AboutSchema = defaultSchema.extend({
  contactInfo: z.array(AboutContactSchema).optional(),
  coverImageId: basePageSchema.shape.coverImageId,
  description: basePageSchema.shape.description,
  featuredEmbedCodeId: uuid.optional(),
  slug: basePageSchema.shape.slug
})

/**
 * END Page schemas
 */

export const PublishedEditionSchema = baseContentSchema.extend({
  releaseId: ReleaseSchema.shape.id,
  publisher: shortText,
  format: z.enum(['LP', '2xLP', 'Cassette', '2xCassette', 'Digital', 'iOSApp', 'CD']),
  publishDate: date,
  coverImageId: basePageSchema.shape.coverImageId,
  imageIds: embeddedItemIdSchemas.imageIds,
  editionSize: z.number().int().nullable().optional(),
  buyLinkId: uuid.optional()
})
