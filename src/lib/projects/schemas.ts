import { z } from 'zod'

import { embedCodeSchema } from '@/lib/embed-codes/schemas/db'
import { imageSchema } from '@/lib/images/schemas/db'
import { linkSchema } from '@/lib/links/schemas/db'
import {
  contentFields,
  relationFields,
  systemFields,
  taxonomyFields
} from '@/lib/schemas/fields'
import { date } from '@/lib/schemas/primitives'
import { venueSchema } from '@/lib/venues/schemas/db'

export const projectTypes = [
  'band',
  'collaborative',
  'eventSeries',
  'radioShow',
  'recordLabel'
] as const
export const projectTypeSchema = z.enum(projectTypes)
export const ProjectTypes = Object.fromEntries(
  projectTypes.map((v) => [v, v])
) as {
  [K in (typeof projectTypes)[number]]: K
}
export type ProjectType = z.infer<typeof projectTypeSchema>

/**
 * Represents a grouping of content that may be associated with multiple events, releases or embedCodes.
 * Can represent a band, collaborative, or other entities like an ongoing radio show or event series.
 * It may be used to suggest content on pages, similar to a tag, but with a broader scope.
 *
 * Site settings is essentially the "default" project, a project should represent a subset of work from overall site.
 */
export const projectSchema = z.object({
  ...systemFields,
  ...taxonomyFields,
  ...contentFields,
  coverImageId: relationFields.coverImageId,
  embedCodeIds: relationFields.embedCodeIds,
  endDate: date.optional(),
  imageIds: relationFields.imageIds,
  linkIds: relationFields.linkIds,
  path: z.literal('projects'),
  startDate: date.optional(),
  type: projectTypeSchema.optional()
})

/**
 * Extends `projectSchema` embedded item metadata.
 */
export const projectClientSchema = projectSchema.extend({
  coverImage: z.lazy(() => imageSchema).optional(),
  embedCodes: z.lazy(() => embedCodeSchema.array()).optional(),
  featuredEmbedCode: z.lazy(() => embedCodeSchema).optional(),
  images: z.lazy(() => imageSchema.array()).optional(),
  links: z.lazy(() => linkSchema.array()).optional(),
  venue: z.lazy(() => venueSchema).optional()
})
