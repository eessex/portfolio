import { z } from 'zod'

const title = z.string().max(255).optional()
const description = z.string().max(10000).optional()
const coverImageId = z.string().uuid().optional()
const slug = z.string().max(255).optional()
const id = z.string().uuid().optional()

/**
 * START Embedded items
 * These schemas are displayed in the client as arrays of objects on another data type such as event or release.
 * They do not have their own standalone pages.
 */
export const EmbedCodeSchema = z.object({
  caption: z.string().max(255).optional(),
  id,
  iframe: z.string().min(1).max(10000),
})

export const ImageSchema = z.object({
  alt: z.string().max(255).optional(),
  aspect: z.number().min(0.1).max(10),
  caption: z.string().max(255).optional(),
  id,
  isPress: z.boolean().optional(),
  url: z.string().url()
})

export const LinkSchema = z.object({
  attribution: z.string().max(255).optional(),
  id,
  isPress: z.boolean().optional(),
  isSocialProfile: z.boolean().optional(),
  publishedDate: z.string().datetime().optional(),
  title,
  url: z.string().url(),
})

export const VenueSchema = z.object({
  id,
  name: z.string().max(255),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional()
})

const embeddedItemSchemas = {
  embedCodeIds: z.array(z.string().uuid()).optional(),
  imageIds: z.array(z.string().uuid()).optional(),
  linkIds: z.array(z.string().uuid()).optional(),
}

/**
 * END Embedded items
 */

/**
 * START Page schemas
 * Data types that have their own standalone pages in the client.
 * These schemas are used to validate data fetched from the database.
 * They may include references to embedded items.
 */

const pageDataSchema = {
  id,
  isPublished: z.boolean().optional(),
  slug,
  title,
  description,
}

export const EventSchema = z.object({
  ...pageDataSchema,
  ...embeddedItemSchemas,
  endDate: z.string().datetime().optional(),
  isAllDay: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  projectIds: z.array(z.string().uuid()).optional(),
  startDate: z.string().datetime(),
  ticketLink: z.string().url().optional(),
  venueId: z.string().uuid().optional(),
})

export const ReleaseSchema = z.object({
  ...pageDataSchema,
  ...embeddedItemSchemas,
  artist: z.string().max(255),
  format: z.string().max(255),
  isCollaboration: z.boolean().optional(),
  isCompilation: z.boolean().optional(),
  isFeature: z.boolean().optional(),
  isPublished: z.boolean(),
  isSingle: z.boolean().optional(),
  label: z.string().max(255).optional(),
  releaseDate: z.string().datetime(),
  streamLink: z.string().url().optional(),
})

export const SettingsSchema = z.object({
  title,
  description,
  coverImageId
})

export const AboutSchema = z.object({
  title,
  description,
  coverImageId
})

/**
 * END Page schemas
 */
