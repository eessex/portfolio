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
  isPublished: bool.optional().default(false)
}

/** related entities from other tables */
export const relationFields = {
  coverImageId: uuid.optional(),
  imageIds: uuidArray.optional(),
  linkIds: uuidArray.optional(),
  embedCodeIds: uuidArray.optional(),
  venueId: uuid.optional()
}

/** slug arrays for related entities */
export const relationSlugArrays = {
  eventSlugs: slugArray,
  projectSlugs: slugArray,
  releaseSlugs: slugArray
}
export type DashboardUsedOnPagesKeys = keyof typeof relationSlugArrays
