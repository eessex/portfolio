import { z } from 'zod'

const defaultString = z.string().max(255)

const title = defaultString.optional()
const description = z.string().max(5000).optional()
const caption = defaultString.optional()
const coverImageId = z.string().uuid().optional()
const slug = defaultString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const id = z.string().uuid()
const projectId = z.string().uuid().optional()
const tagIds = z.array(z.string().uuid()).default([])
const createdAt = z.string().datetime()
const updatedAt = z.string().datetime().optional()
const url = z.string().url().max(255)
const isPublished = z.boolean().optional()
const publishedDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const defaultDates = {
  createdAt,
  updatedAt
}

const embeddedItemSchema = {
  ...defaultDates,
  id,
  projectId,
  tagIds,
  title
}

const pageDataSchema = {
  ...embeddedItemSchema,
  slug,
  description,
  isPublished,
  coverImageId
}

const embeddedItemSchemas = {
  embedCodeIds: z.array(id).optional(),
  imageIds: z.array(id).optional(),
  linkIds: z.array(id).optional(),
}

const { projectId: _projectId, ...projectType } = pageDataSchema
export const ProjectSchema = z.object({
  ...projectType,
  ...embeddedItemSchemas
})

// 2. Tags
export const TagSchema = z.object({
  ...defaultDates,
  id,
  isPublished
})

// 3. Users
export const UserSchema = z.object({
  ...defaultDates,
  id,
  name: defaultString,
  email: z.string().email(),
  password: z.string().min(8)
})

// 4. Email Subscriptions
export const EmailSubscriptionSchema = z.object({
  ...defaultDates,
  id,
  email: z.string().email(),
  exportedAt: z.date().nullable().optional()
})

export const SlugHistorySchema = z.object({
  id,
  tableName: z.string().max(50),
  rowId: id,
  oldSlug: slug,
  createdAt,
})

export const EmbedCodeSchema = z.object({
  ...embeddedItemSchema,
  caption,
  iframe: z.string().min(1).max(1000),
  type: z.enum(['audio', 'video']).optional()
})

export const ImageSchema = z.object({
  ...embeddedItemSchema,
  alt: defaultString.optional(),
  aspect: z.number().min(0.1).max(10),
  caption,
  isHiddenOnAboutPage: z.boolean().optional(),
  isPress: z.boolean().optional(),
  url
})

export const LinkSchema = z.object({
  ...embeddedItemSchema,
  url,
  attribution: defaultString.optional(),
  publishedDate: publishedDate.optional(),
  quotation: defaultString.optional(),
  type: z.enum(['press', 'social', 'buy_link', 'stream_link']).optional(),
  isHiddenOnAboutPage: z.boolean().optional()
})

export const VenueSchema = z.object({
  id,
  ...defaultDates,
  address: defaultString.optional(),
  city: defaultString,
  name: defaultString.optional(),
  state: defaultString.optional(),
  country: defaultString.optional(),
  url: url.optional(),
  timezone: z.string().max(100).optional(),
  primaryVenueId: z.string().uuid().optional()
})

/**
 * START Page schemas
 * Data types that have their own standalone pages in the client.
 * These schemas are used to validate data fetched from the database.
 * They may include references to embedded items.
 */

export const EventSchema = z.object({
  ...pageDataSchema,
  ...embeddedItemSchemas,
  endDate: z.string().datetime().optional(),
  startDate: z.string().datetime(),
  ticketLink: z.string().url().optional(),
  venueId: z.string().uuid().optional(),
})

export const ExhibitionSchema = z.object({
  ...pageDataSchema,
  ...embeddedItemSchemas,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  venueId: EventSchema.shape.venueId
})

export const ReleaseSchema = z.object({
  ...pageDataSchema,
  ...embeddedItemSchemas,
  artist: defaultString,
  type: z.enum(['album', 'ep', 'soundtrack', 'feature', 'compilation', 'collaborative_release', 'single']),
  releaseDate: publishedDate
})

export const WorkSchema = z.object({
  ...pageDataSchema,
  ...embeddedItemSchemas
})

export const SettingsSchema = z.object({
  ...defaultDates,
  coverImageId,
  description: defaultString.optional(),
  id,
  title
})

export const AboutContactSchema = z.object({ title: defaultString, contact: defaultString })

export const AboutSchema = z.object({
  ...defaultDates,
  coverImageId,
  contactInfo: z.array(AboutContactSchema).optional(),
  featuredEmbedCodeId: z.string().uuid().optional(),
  description,
  id,
  slug
})

/**
 * END Page schemas
 */

export const PublishedEditionSchema = z.object({
  ...embeddedItemSchema,
  releaseId: ReleaseSchema.shape.id,
  publisher: defaultString,
  format: z.enum(['LP', '2xLP', 'Cassette', '2xCassette', 'Digital', 'iOSApp', 'CD']),
  publishDate: publishedDate,
  coverImageId,
  imageIds: embeddedItemSchemas.imageIds,
  editionSize: z.number().int().nullable().optional(),
  buyLink: id.optional()
})
