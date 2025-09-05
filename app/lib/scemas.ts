import { z } from 'zod'

const title = z.string().max(255).optional()
const description = z.string().max(5000).optional()
const coverImageId = z.string().uuid().optional()
const slug = z.string().max(1000).optional()
const id = z.string().uuid().optional()
const projectId = z.string().uuid().optional()
const tagIds = z.array(z.string().uuid()).default([])
const createdAt = z.string().datetime().optional()
const updatedAt = z.string().datetime().optional()
const url = z.string().url().max(255)

export const EmbedCodeSchema = z.object({
  id,
  projectId,
  tagIds,
  caption: z.string().max(255).optional(),
  iframe: z.string().min(1).max(1000),
  title,
  type: z.enum(['audio', 'video']).optional(),
  createdAt,
  updatedAt
})

export const ImageSchema = z.object({
  id,
  projectId,
  tagIds,
  alt: z.string().max(255).optional(),
  aspect: z.number().min(0.1).max(10),
  caption: z.string().max(255).optional(),
  isHiddenOnAboutPage: z.boolean().optional(),
  isPress: z.boolean().optional(),
  title,
  url,
  createdAt,
  updatedAt
})

export const LinkSchema = z.object({
  id,
  projectId,
  tagIds,
  url,
  attribution: z.string().max(255).optional(),
  publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  quotation: z.string().max(255).optional(),
  title,
  type: z.enum(['press', 'social', 'buy_link', 'stream_link']).optional(),
  isHiddenOnAboutPage: z.boolean().optional(),
  createdAt,
  updatedAt
})

export const VenueSchema = z.object({
  id,
  address: z.string().max(255).optional(),
  city: z.string().max(255),
  name: z.string().max(255).optional(),
  state: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  url: url.optional(),
  timezone: z.string().max(100).optional(),
  primaryVenueId: z.string().uuid().optional(),
  createdAt,
  updatedAt
})

const embeddedItemSchemas = {
  embedCodeIds: z.array(z.string().uuid()).optional(),
  imageIds: z.array(z.string().uuid()).optional(),
  linkIds: z.array(z.string().uuid()).optional(),
}

/**
 * START Page schemas
 * Data types that have their own standalone pages in the client.
 * These schemas are used to validate data fetched from the database.
 * They may include references to embedded items.
 */

const pageDataSchema = {
  id,
  projectId,
  tagIds,
  title,
  slug,
  description,
  isPublished: z.boolean().optional(),
  coverImageId,
  createdAt,
  updatedAt,
}

export const EventSchema = z.object({
  ...pageDataSchema,
  ...embeddedItemSchemas,
  endDate: z.string().datetime().optional(),
  startDate: z.string().datetime(),
  ticketLink: z.string().url().optional(),
  venueId: z.string().uuid().optional(),
})

export const ReleaseSchema = z.object({
  ...pageDataSchema,
  ...embeddedItemSchemas,
  artist: z.string().max(255),
  type: z.enum(['album', 'ep', 'soundtrack', 'feature', 'compilation', 'collaborative_release', 'single']),
  releaseDate: z.string().datetime()
})

export const SettingsSchema = z.object({
  coverImageId,
  description,
  id: z.string().uuid(),
  title,
  createdAt,
  updatedAt
})

const ContactSchema = z.object({ title: z.string().max(255), contact: z.string().max(255) })

export const AboutSchema = z.object({
  coverImageId,
  contactInfo: z.array(ContactSchema).optional(),
  featuredEmbedCodeId: z.string().uuid().optional(),
  description,
  id: z.string().uuid(),
  slug,
  title
})

/**
 * END Page schemas
 */
