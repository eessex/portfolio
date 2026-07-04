import type z from 'zod'

import { relationSlugArrays } from '@/lib/schemas/fields'
import { venueSchema } from '@/lib/venues/schemas/db'

/**
 * Extends `venueSchema` with the pages that embed it.
 * Venues are only ever linked to events, so unlike other embedded
 * items, `projectSlugs`/`releaseSlugs` are never populated.
 */
export const dashboardVenueSchema = venueSchema.extend({
  eventSlugs: relationSlugArrays.eventSlugs,
  projectSlugs: relationSlugArrays.projectSlugs.optional(),
  releaseSlugs: relationSlugArrays.releaseSlugs.optional()
})
export type DashboardVenue = z.infer<typeof dashboardVenueSchema>
