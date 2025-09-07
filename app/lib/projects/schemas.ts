import { basePageSchema, embeddedItemIdSchemas } from '@/lib/scemas'
import { z } from 'zod'

/**
 * Represents a grouping of content that may be associated with multiple events, releases or embedCodes.
 * Can represent a band, collaborative, or other entities like an ongoing radio show or event series.
 * It may be used to suggest content on pages, similar to a tag, but with a broader scope.
 *
 * Site settings is essentially the "default" project, a project should represent a subset of work from overall site.
 */
export const projectSchema = z.lazy(() =>
  basePageSchema.omit({ projectId: true }).extend({
    ...embeddedItemIdSchemas.shape
  })
)
