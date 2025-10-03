import { z } from 'zod'

import {
  basePageSchema,
  date,
  embeddedItemIdSchemas,
  hydratedItemIdSchemas
} from '@/lib/schemas'

export const projectTypes = [
  'band',
  'collaborative',
  'eventSeries',
  'radioShow',
  'recordLabel'
] as const

/**
 * Represents a grouping of content that may be associated with multiple events, releases or embedCodes.
 * Can represent a band, collaborative, or other entities like an ongoing radio show or event series.
 * It may be used to suggest content on pages, similar to a tag, but with a broader scope.
 *
 * Site settings is essentially the "default" project, a project should represent a subset of work from overall site.
 */
export const projectSchema = z.lazy(() =>
  basePageSchema.omit({ projectId: true }).extend({
    ...embeddedItemIdSchemas.shape,
    type: z.enum(projectTypes).optional(),
    startDate: date.optional(),
    endDate: date.optional()
  })
)

/**
 * Extends `projectSchema` embedded item metadata.
*/
export const projectClientSchema = z.lazy(() =>
  z.object({
    ...hydratedItemIdSchemas.pick({
      coverImage: true,
      embedCodes: true,
      featuredEmbedCode: true,
      images: true,
      links: true,
      venue: true
    }).shape
  }).and(projectSchema)
)
