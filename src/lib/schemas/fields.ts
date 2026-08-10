import { z } from 'zod'

import {
  bool,
  date,
  longText,
  shortText,
  slug,
  slugArray,
  uuid,
  uuidArray
} from '@/lib/schemas/primitives'

/** columns present on all tables */
export const systemFields = {
  id: uuid,
  createdAt: date,
  updatedAt: date.optional()
}

/** parent entities */
export const ownershipFields = {
  projectId: uuid.optional()
}

/** columns used for filter/search */
export const taxonomyFields = {
  tagIds: uuidArray.optional()
}

/** columns for page content */
export const contentFields = {
  title: shortText,
  description: longText.optional(),
  shortDescription: shortText.optional(),
  slug,
  isPublished: bool.optional()
}

/** related entities from other tables */
export const relationFields = {
  coverImageId: uuid.optional(),
  imageIds: uuidArray.optional(),
  linkIds: uuidArray.optional(),
  embedCodeIds: uuidArray.optional(),
  venueId: uuid.optional()
}

/**
 * A single labelled contact entry (e.g. `{title: 'Bookings', contact:
 * 'bookings@example.com'}`). `contact` is free-text (may be an email,
 * phone, address, or handle) and required — a bare value is meaningful
 * on its own; `title` is an optional label. Shared so every project
 * (including the default/about project) renders contacts consistently.
 */
export const contactSchema = z.object({
  title: shortText.optional(),
  contact: shortText
})
export type Contact = z.infer<typeof contactSchema>

/** repeatable per-entity contact list */
export const contactFields = {
  contactInfo: z.array(contactSchema).optional()
}

/** slug arrays for related entities */
export const relationSlugArrays = {
  eventSlugs: slugArray,
  projectSlugs: slugArray,
  releaseSlugs: slugArray
}
export type DashboardUsedOnPagesKeys = keyof typeof relationSlugArrays
